const creditLimit = 1000

const pending: {[key: string]: Transaction} = {}
const settled: {[key: string]: Transaction} = {}
let availableCredit: number = creditLimit
let payableBalance: number = 0

const eventFunctions: {[key: string]: (event: Event) => void} = {
    'TXN_AUTHED': (event) => {
        if (availableCredit >= event.amount) {
            pending[event.txnId] = {
                id: event.txnId,
                amount: event.amount,
                time: new Date()
            }
            availableCredit -= event.amount
        }
    },
    'TXN_AUTH_CLEARED': (event) => {
        availableCredit += pending[event.txnId].amount
        delete pending[event.txnId]
    },
    'TXN_SETTLED': (event) => {
        const amountDiff = event.amount - pending[event.txnId].amount
        availableCredit -= amountDiff
        payableBalance += event.amount
        settled[event.txnId] = { ...pending[event.txnId], amount: event.amount, time: new Date() }
        delete pending[event.txnId]
    },
    'PAYMENT_INITIATED': (event) => {
        if (-event.amount <= payableBalance) {
            pending[event.txnId] = {
                id: event.txnId,
                amount: event.amount,
                time: new Date()
            }


            payableBalance += event.amount
        }
    },
    'PAYMENT_CANCELED': (event) => {
        payableBalance -= pending[event.txnId].amount
        delete pending[event.txnId]
    },
    'PAYMENT_POSTED': (event) => {
        const oldAmount = pending[event.txnId].amount
        availableCredit -= oldAmount
        settled[event.txnId] = { ...pending[event.txnId], amount: oldAmount, time: new Date() }
        delete pending[event.txnId]
    }
}

function summarize() {
    console.log('======== SUMMARY ========')
    const pendingTransactionsOutput = Object.values(pending).map(x => `${x.id}: ${x.amount < 0 ? '-' : ''}$${Math.abs(x.amount)} @ ${x.time.toISOString()}`).join('\n')
    const mostRecentSettled = Object.values(settled).sort((a, b) => a.time > b.time ? -1 : 1)
    const threeMostRecentSettled = mostRecentSettled.slice(0, Math.max(3,mostRecentSettled.length))
    const settledTransactionsOutput = threeMostRecentSettled.map(x => `${x.id}: ${x.amount < 0 ? '-' : ''}$${Math.abs(x.amount)} @ ${x.time.toISOString()}`).join('\n')
    
    const output = `Available credit: $${availableCredit}\n` +
                    `Payable balance: $${payableBalance}\n\n` +
                    'Pending transactions:\n' +
                    pendingTransactionsOutput + '\n' + (pendingTransactionsOutput.length ? '\n' : '') +
                    'Settled transactions:' + (settledTransactionsOutput.length ? '\n' : '') +
                    settledTransactionsOutput
                    
    console.log(output)
    console.log('=========================')

}


const routes: { [key: string]: (req: Request) => Promise<Response> } = {
    'GET /': async (req) => {
        summarize()
        return Response.json({ pending, settled, availableCredit, payableBalance })
    },
    'POST /': async (req) => {
        const event: Event = await req.json()
        eventFunctions[event.eventType](event)
        return Response.json({ pending, settled, availableCredit, payableBalance })
    }
}

interface Event {
    eventType: string,
    txnId: string,
    amount: number,
}

interface Transaction {
    id: string,
    amount: number,
    time: Date
}

const PORT = 3000
Bun.serve({
    port: PORT,
    fetch(req: Request) {            
        const url = new URL(req.url)
        const method = req.method
        const lookup = method  + ' ' + url.pathname

        if (routes[lookup] === undefined) return new Response('404!')

        return routes[lookup](req)
    }
})
console.log('Server started at port', PORT)
