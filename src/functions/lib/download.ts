import path from "path"
import { writeFile, unlink } from "fs/promises"
import { existsSync, mkdirSync, rmdirSync, readdirSync } from "fs"
import fs from "fs"
const tempFolder = path.join(process.cwd(), 'temp');


const downloadFromURL = async (url: string, format: string, name: string) => {
    try {
        await createTempFolder();
        const outPath = path.join(`${tempFolder}/${name}.${format}`);
        return await fetch(url)
            .then((x) => x.arrayBuffer())
            .then((x) => writeFile(outPath, Buffer.from(x)))
            .then(() => outPath)
            .catch(err => console.log(err))
    } catch (err) {
        console.log(err)
    }

}
const getBufferFromURL = async (url: string, name: string): Promise<Buffer | undefined> => {
    console.log(url)
    const format = url.split(".").pop()
    if (!format) return
    const path = await downloadFromURL(url, format, name)
    if (!path) return
    setTimeout(() => {
        clearDownload(path)
    }, 1000 * 30)
    return fs.readFileSync(path)
}
const clearDownload = async (filePath: string) => {
    await unlink(filePath);
    await safeDeleteIfEmpty()
}


const createTempFolder = async () => {
    if (existsSync(tempFolder)) return
    mkdirSync(tempFolder, { recursive: true });
}
async function safeDeleteIfEmpty() {

    //si la carpeta no existe
    if (!existsSync(tempFolder)) return

    //si la carpeta no tiene archivos
    const files = readdirSync(tempFolder);
    if (files.length > 0) return

    try {
        rmdirSync(tempFolder);
    } catch (err) {
        console.error('Error al borrar la carpeta:', err);
    }
}


export { downloadFromURL, clearDownload, getBufferFromURL };