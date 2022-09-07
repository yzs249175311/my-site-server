export type BookProvider  = "鸠摩" | "zlibrary"

export interface Book {
    title:string,
    desc:string,
    link:string,
    from?:BookProvider,
    author?:string,
    image?:string,
}