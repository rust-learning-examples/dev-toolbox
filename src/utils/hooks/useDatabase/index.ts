import type { UnwrapNestedRefs } from 'vue'
import { reactive } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { tauri, path, fs, clipboard } from "@tauri-apps/api"
import SQLite from 'tauri-plugin-sqlite-api'
import { Language } from './Language'
import { CodeSnippet } from './CodeSnippet'

class DatabaseManager {
  db: SQLite;
  tables: UnwrapNestedRefs<{languages: Language[], codeSnippets: CodeSnippet[]}>;

  constructor(db: SQLite) {
    this.db = db
    this.tables = reactive({
      languages: [],
      codeSnippets: []
    })
    this.fetchAllLanguages()
  }

  async fetchAllLanguages() {
    const items = await this.db.select<Array<any>>(`select * from languages`)
    this.tables.languages = items.map((item: any) => new Language(item))
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

  const manager = new DatabaseManager(db)
  appWindow.listen('CODE_SNIPPET_INPUT_TEXT', async event => {
    let inputText = event.payload as string;;
    if (/^@/.test(inputText)) {
      inputText = inputText.substring(1)
      const [languageName, ...others] = inputText.split(' ')
      const code = others.join(' ')
      if (languageName && code) {
        let languages = await db.select<Array<any>>(`select * from languages where name = $1 --case-insensitive limit 1;`, [languageName])
        if (languages.length) {
          let language = languages[0] as any;
          const codeSnippets = await db.select<Array<any>>(`select * from code_snippets where language_id = $1 AND code = $2 --case-insensitive limit 1;`, [language.id, code])
          if (codeSnippets.length) {
            const item = codeSnippets[0] as any;
            await clipboard.writeText(item.content) // copy
            await tauri.invoke('code_snippet_handle', {
              inputText: event.payload,
              replaceContent: item.content,
            })
          }
          // console.log(123, 'inputText', event, languageName, code, language, codeSnippets)
        }
      }
    }
  })

  return manager
}

let globalManager: DatabaseManager | null = null
export async function useDatabaseAsync() {
  if (!globalManager) {
    globalManager = await initGlobalManager()
  }
  return globalManager
}

export function useDatabase() {
  return globalManager
}