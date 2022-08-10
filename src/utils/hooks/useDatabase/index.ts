import type { UnwrapNestedRefs } from 'vue'
import { reactive } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import * as tauriEvent from '@tauri-apps/api/event'
import { tauri, path, fs, clipboard } from "@tauri-apps/api"
import SQLite from 'tauri-plugin-sqlite-api'
import { Language } from './Language'
import { CodeSnippet } from './CodeSnippet'
import jsMd5 from 'js-md5'

class DatabaseManager {
  db: SQLite;
  state: UnwrapNestedRefs<{languages: Language[], lastCodeSnippetUserInput: string}>;

  constructor(db: SQLite) {
    this.db = db
    this.state = reactive({
      languages: [],
      lastCodeSnippetUserInput: ''
    })
  }

  /**
   * code snippets
   */
  async listenCodeSnippetEvent() {
    appWindow.listen('CODE_SNIPPET_INPUT_TEXT', async event => {
      let inputText = event.payload as string;
      this.state.lastCodeSnippetUserInput = inputText;
      if (/^@/.test(inputText)) {
        inputText = inputText.substring(1)
        const [languageName, ...others] = inputText.split(' ')
        const code = others.join(' ')
        if (languageName && code) {
          let languages = await this.db.select<Array<any>>(`select * from languages where name = $1 --case-insensitive limit 1;`, [languageName])
          if (languages.length) {
            let language = languages[0] as any;
            const codeSnippets = await this.db.select<Array<any>>(`select * from code_snippets where language_id = $1 AND code = $2 --case-insensitive limit 1;`, [language.id, code])
            if (codeSnippets.length) {
              const item = codeSnippets[0] as any;
              await clipboard.writeText(item.content) // copy
              await tauri.invoke('code_snippet_handler', {
                inputText: event.payload,
                replaceContent: item.content,
              })
            }
            // console.log(123, 'inputText', event, languageName, code, language, codeSnippets)
          }
        }
      }
    })
  }
  async listenClipboardEvent() {
    appWindow.listen('CLIPBOARD_VALUE', async event => {
      const payload: any = event.payload
      const type = payload.Text ? 0 : 1
      if (type === 0) {
        const content = payload.Text
        let short_content = content.slice(0, 255)
        if (content.length > 255) {
          short_content = `${short_content.slice(0, 255 - 3)}...`
        }
        const md5 = jsMd5(content) as string;

        const histories = await this.db.select<Array<any>>(`select * from clipboard_histories where type = $1 AND md5 = $2 limit 1;`, [type, md5])
        if (histories.length) {
          const sql = `UPDATE clipboard_histories set updated_at = datetime('now', 'localtime') where id = ${histories[0].id}`
          await this.db.execute(sql)
        } else {
          let sql = `INSERT INTO clipboard_histories(type, md5, short_content, content) values($1, $2, $3, $4)`
          await this.db.execute(sql, [type, md5, short_content, content])
        }
      } else { // type === 1
        const dataBuffer = new Uint8Array(payload.Image.bytes)
        const md5 = jsMd5(dataBuffer) as string;
        const histories = await this.db.select<Array<any>>(`select * from clipboard_histories where type = $1 AND md5 = $2 limit 1;`, [type, md5])
        if (histories.length) {
          const sql = `UPDATE clipboard_histories set updated_at = datetime('now', 'localtime') where id = ${histories[0].id}`
          await this.db.execute(sql)
        } else {
          const blobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          const trnasRecordBytesToBlob = async(imageData: {bytes: any, width: number, height: number}) => {
            const {bytes, width, height} = imageData
            return new Promise((resolve, reject) => {
              const canvas: HTMLCanvasElement = document.createElement('canvas')
              canvas.width = width
              canvas.height = height
              const context = canvas.getContext('2d')
              const imgData = context!.createImageData(width, height)
              for (let i = 0; i < bytes.length; i++) {
                imgData.data[i] = bytes[i]
              }
              context!.putImageData(imgData, 0, 0)

              // 250 x 190
              const defaultRate = 250 / 190
              const currentRate = canvas.width / canvas.height
              const scale = currentRate > defaultRate ? (250 / canvas.width) : (190 / canvas.height)
              const scaleCanvas: HTMLCanvasElement = document.createElement('canvas')
              const scaleContext = scaleCanvas.getContext('2d')
              scaleCanvas.width = canvas!.width * scale;
              scaleCanvas.height = canvas!.height * scale;
              scaleContext!.scale(scale, scale)
              scaleContext!.drawImage(canvas, 0, 0);
              scaleCanvas!.toBlob((blob) => {
                if (blob) resolve(blob)
                else reject()
              }, 'image/jpeg', 0.8)
            })
          }

          const image = await blobToBase64(new Blob([dataBuffer.buffer], {type: 'image/jpeg'}))
          const short_blob = await trnasRecordBytesToBlob(payload.Image) as Blob
          const short_image = await blobToBase64(short_blob)
          const image_width = payload.Image.width
          const image_height = payload.Image.height
          let sql = `INSERT INTO clipboard_histories(type, md5, short_image, image, image_width, image_height) values($1, $2, $3, $4, $5, $6)`
          await this.db.execute(sql, [type, md5, short_image, image, image_width, image_height])
        }
      }
      await tauriEvent.emit('ClipboardHistoryUpdated', {})
    })
  }
  async fetchAllLanguages() {
    const items = await this.db.select<Array<any>>(`select * from languages`)
    this.state.languages = items.map((item: any) => new Language(item))
  }
  async destroy() {
    await this.db.close()
  }
}

async function initGlobalManager() {
  // init db
  await fs.createDir('data', { dir: fs.BaseDirectory.App, recursive: true });
  let dbPath = await path.appDir()
  dbPath = await path.join(dbPath, `./data/${import.meta.env.MODE}.db`)
  console.log('db path:', dbPath)
  const db = await SQLite.open(dbPath)
  await db.execute(`CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name varchar(255) UNIQUE NOT NULL,
    desc varchar(255),
    created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')));`
  )
  await db.execute(`CREATE TABLE IF NOT EXISTS code_snippets (
    id integer primary key AUTOINCREMENT,
    language_id integer,
    code varchar(255) NOT NULL,
    content text,
    desc varchar(255),
    created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    unique(language_id, code));`
  )
  await db.execute(`CREATE TABLE IF NOT EXISTS http_proxy_rules (
    id integer primary key AUTOINCREMENT,
    title varchar(255) NOT NULL,
    address_rule varchar(255) NOT NULL,
    target_address varchar(255) NOT NULL,
    remark text,
    enabled boolean DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')));`
  )
  // type text: 0, image: 1
  await db.execute(`CREATE TABLE IF NOT EXISTS clipboard_histories (
    id integer primary key AUTOINCREMENT,
    type integer NOT NULL,
    md5 varchar(255) NOT NULL,
    short_content varchar(255),
    content text,
    short_image text,
    image text,
    image_width integer,
    image_height integer,
    created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
    unique(type, md5));`
  )

  const manager = new DatabaseManager(db)
  return manager
}

let globalManager: DatabaseManager | null = null
export async function useDatabaseAsync() {
  if (!globalManager) {
    globalManager = await initGlobalManager()
    // clipboard history最多保留9999条
    await globalManager.db.execute(`DELETE FROM clipboard_histories where updated_at < (
      SELECT min(updated_at) from (SELECT updated_at FROM clipboard_histories ORDER BY updated_at DESC limit 9999)
    );`)
  }
  return globalManager
}

export function useDatabase() {
  return globalManager
}