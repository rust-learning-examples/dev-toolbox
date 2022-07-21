export class CodeSnippet {
  id: number;
  language_id: number;
  code: string;
  content: string;
  desc?: string;
  created_at?: Date;
  updated_at?: Date;

  constructor(obj: {id: number, language_id: number, code: string, content: string}) {
    Object.assign(this, obj)
    this.id = obj.id
    this.language_id = obj.language_id
    this.code = obj.code
    this.content = obj.content
  }
}