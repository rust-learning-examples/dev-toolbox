import SQLite from 'tauri-plugin-sqlite-api'
import * as http from '@tauri-apps/api/http'
import * as notification from '@tauri-apps/api/notification'
export class StockService {
  db: SQLite;

  static async getDetail(code: string) {
    return await Promise.race([
      this.getTTDetail([code]).then(items => items.length ? items[0] : null)
    ])
  }
  // 腾讯股票
  static async getTTDetail(codes: string[]) {
    const apiUrl = `http://qt.gtimg.cn/q=sz${ codes.join(',') }`
    const response: any = await http.fetch(apiUrl, {
      method: 'GET',
      responseType: http.ResponseType.Binary,
    })
    // https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
    let utf8decoder = new TextDecoder('GBK')
    const resData = utf8decoder.decode(new Uint8Array(response.data))
    let list = [], arr = resData.split(';');
    for (let i = 0; i < arr.length; i++) {
      arr[i].split('~').length > 33 && list.push({
        name: arr[i].split('~')[1],
        price: arr[i].split('~')[3],
        // range: arr[i].split('~')[32]
      })
    }
    return list
  }

  constructor(db: SQLite) {
    this.db = db;
  }
  // default 0.5 hour
  async checkNoticeInterval(intervalTime = 0.5 * 60 * 60 * 1000) {
    const stocks = await this.db.select<Array<any>>(`select * from stocks where enabled = 1 order by updated_at desc;`) as any[]
    for (const stock of stocks) {
      const onlineDetail = await StockService.getDetail(stock.code)
      if (!onlineDetail) {
        continue;
      }
      stock.price = Number(onlineDetail.price)
      const sql = `UPDATE stocks set price = $1, price_at = datetime('now', 'localtime') where id = ${stock.id}`
      await this.db.execute(sql, [stock.price])
      console.log(110, stock.price, stock.notice_lower_price)
      if (stock.price <= stock.notice_lower_price) {
        console.log(111111)
        notification.sendNotification({title: stock.name, body: `当前价格${stock.price}, 低于通知价格${stock.notice_lower_price}`})
      }
      if (stock.price > stock.notice_higher_price) {
        notification.sendNotification({title: stock.name, body: `当前价格${stock.price}, 高于通知价格${stock.notice_higher_price}`})
      }
    }
    setTimeout(() => {
      this.checkNoticeInterval(intervalTime)
    }, intervalTime)
  }
}