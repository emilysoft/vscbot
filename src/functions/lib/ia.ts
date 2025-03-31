export default async function (prompt: string) {
    return await fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(prompt)}`)
        .then(res => res.json())
        .then(res => res.response)
}