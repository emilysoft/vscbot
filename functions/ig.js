.t create ig {js:
    const regex = /(https?:\/\/(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)\/?)/gim
const message = discord.message;
let arg0;
const matched = message.content.match(regex)
if (matched != null) {
    arg0 = matched[0]
} else {
    throw new Error("no hay archivo adjunto");
}

const module =async function instagramGetUrl(url_media) {
    try {
        const BASE_URL = "https://api.sssgram.com/st-tik/ins/dl?";
        const url = `${BASE_URL}url=${url_media}&timestamp=${Date.now()}`;

        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate, br",
            Origin: "https://www.sssgram.com",
            Connection: "keep-alive",
            Referer: "https://www.sssgram.com/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
        };

        const response = await fetch(url, { headers });
        const data = await response.json();

        let igresponse = {
            results_number: data.result.count || 0,
            url_list: [],
        };
        if (data.result.count !== null) {
            data.result.insBos.forEach((media) => {
                igresponse.url_list.push(media.url);
            });
        }

        return igresponse;
    } catch (err) {
        throw err;
    }
}

async function main() {
    let links = await instagramGetUrl(arg0);
    discord.variables.arg0 = links.url_list[0]
}


main();
}

{iscript:
load {get:arg0} video 
} 


