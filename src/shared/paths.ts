import { extname } from 'path'

export const fileExtensionFrom = (path: string) => extname(path).slice(1)
