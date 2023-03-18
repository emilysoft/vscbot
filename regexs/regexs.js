module.exports = {
    pedofilia: [
        "p(3|e)dr(a|@)st((a|@)|(i|!|¡||))a?",
        "(relacion(es)?|sexo|cojer|follar|tirar)scons(una?s)?((des1[0-7])|menor(es)?|niñ(a|o)s?)",
        "\b(pa(s|c)en)?(c|Ç|с|ƈ|ċ|ż|ʐ|x|z|s|ʂ)+e?([s._-]+)?p+\b",
        "p+(\n+|s+)?(e|3)+(\n+|s+)?d+(\n+|s+)?(o|о|ο|օ|ȯ|ọ|ỏ|ơ|ó|ò|ö|0|°)+(\n+|s+)?(f+(\n+|s+)?(1|i|!|¡||ï|í)+(\n+|s+)?l+(\n+|s+)?(o|0|°)+|b+(3|e)+(4a|@)r)",
        "(r+(s+|\n+)?(4|a|@)+(s+|\n+)?(i|1|!|¡||)+(s+|\n+)?d+(s+|\n+)?|(ո|n|И)+(s+|\n+)?(u|υ|ս|ü|ú|ù)+(s+|\n+)?k+(s+|\n+)?(3|e))",
    ],
    raid:'\b([^tr]+)?(r+(\s+|\n+)?(4|a|@)+(\s+|\n+)?(i|1|!|¡|\|)+(\s+|\n+)?d+(\s+|\n+)?|(ո|n|И)+(\s+|\n+)?(u|υ|ս|ü|ú|ù)+(\s+|\n+)?k+(\s+|\n+)?(3|e))([\.\-_]+)?\b',
    discordInvites:
        "/(https?://)?(www.)?(((discord(app)?)?.com/invite)|((discord(app)?)?.?gg))/(?<invite>.+)/",
    bio: "/^(((a|@)+br(3|e)|m(i|y|!|¡)+ra+)s+m(i|y)+s+(las+)?)?((v|b)+(i|y|!|¡)+(o|0)|p+(e|3)+r+f+(i|y|!|¡)+l+)/",
    tags: ["/^..*gg/.*/"],
    datosPersonales: [
        "/\b(d([s\n-.]+)?){2}(d(([s\n-.]+)?)){10,11}\b/",
        "/brayan romero/",
    ],
    pirateria: [
        "/((https?://)?(www.)?)?(mediafire|mega|(drive(s+)?.(s+)?google))(s+)?.(s+)?[a-zA-Z]/",
    ],
    lenguajes: ["/^[\u0370-\u1FFF]/"],
};
