export class Language {
  id: number;
  name: string;
  desc?: string;
  created_at?: Date;
  updated_at?: Date;

  constructor(obj: {id: number, name: string}) {
    Object.assign(this, obj)
    this.id = obj.id
    this.name = obj.name
  }
}