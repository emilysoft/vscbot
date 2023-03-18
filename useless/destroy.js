//este comando debe timeoutear al user
//tiene que banearlos 4 segundos luego de que termine
//este comando debe borrar todos los posibles mensajes del usuarios
const chalk = require('chalk')
async function destroy() {
    console.log('Destroy en progreso')
    for (let i = 11; i > 0; i--) {
        await counter(i).then(() => {
            if (i <= 1) {
                console.log("karling fue baneado");
            }
        });
    }
}
destroy();
const reason = "incumplir las reglas"
function counter(count) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                console.log(
                    chalk.bgRed(
                        `🔴Karling#1234 Se te baneará del servidor por ${reason} en ${count-1}s.🔴`
                    )
                )
            );
        }, 1000);
    });
}
