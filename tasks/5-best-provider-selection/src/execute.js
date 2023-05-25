import { readFileSync, writeFileSync } from 'fs';
import {
    Package,
    Accounts,
    Allocation,
    Demand,
    DemandEventType,
    Agreement,
    Activity,
    Deploy,
    Run,
    Script,
    Start,
    ConsoleLogger,
    Payments,
    InvoiceEvent,
    PaymentEventType,
    DebitNoteEvent
} from "yajsapi";
import { GftpStorageProvider } from "yajsapi/dist/storage/index.js"

const TOP_PROVIDERS = 3;
const TIME_WEIGHT = 1;
const PRICE_WEIGHT = 1000;
const OFFER_TIMEOUT = 300000;
const logger = new ConsoleLogger();

const getTopProviders = (count = TOP_PROVIDERS) => {
    const providers = JSON.parse(readFileSync('providers.json'));
    const rankedProviders = Object.keys(providers).sort((a, b) => {
        const aScore = providers[a].cost * PRICE_WEIGHT + providers[a].timeTaken * TIME_WEIGHT;
        const bScore = providers[b].cost * PRICE_WEIGHT + providers[b].timeTaken * TIME_WEIGHT;
        return aScore - bScore;
    });
    return rankedProviders.slice(0, count);
};

async function runJob(agreement) {
    const activity = await Activity.create(agreement.id, { logger });
    const gftpStorageProvider = new GftpStorageProvider(logger);
    await gftpStorageProvider.init();
    const script = Script.create([
        new Deploy(),
        new Start(),
        new Run("/bin/sh", ["-c", "date +%s"]),
        new Run("/bin/sh", ["-c", "blender -b cubes.blend -E CYCLES -o /golem/output/cubes_####.png -f 20 -t 0"]),
        new Run("/bin/sh", ["-c", "date +%s"]),
    ]);
    const exeScript = script.getExeScriptRequest();
    const streamResult = await activity.execute(exeScript, undefined, 7200000);

    const results = [];
    for await (const result of streamResult)
        results.push(result);
    await gftpStorageProvider.close();
    await activity.stop();
    await agreement.terminate();
    return results;
}

async function main() {
    const topProvidersIds = getTopProviders();

    const vmPackage = Package.create({ imageHash: "dadcf728a4cc12a957b0fea625dedfcdb1a3d8ae9d6212ff532cd69e" });
    const accounts = await (await Accounts.create({ yagnaOptions: { apiKey: process.env.YAGNA_APPKEY } })).list();

    const account = accounts.find((account) => account?.platform === 'erc20-rinkeby-tglm');
    if (!account) throw new Error("There is no available account");
    const allocation = await Allocation.create({ account, logger });
    const demand = await Demand.create(vmPackage, [allocation], { logger });

    const payments = await Payments.create({ logger });
    const processPayment = (event) => {
        if (event instanceof InvoiceEvent) {
            event.invoice.accept(event.invoice.amount, allocation.id).catch((e) => logger.warn(e));
        }
        if (event instanceof DebitNoteEvent) {
            event.debitNote.accept(event.debitNote.totalAmountDue, allocation.id).catch((e) => logger.warn(e));
        }
    };
    payments.addEventListener(PaymentEventType, processPayment);

    let jobRunning = false;
    setTimeout(async () => {
        if (!jobRunning) {
            demand.removeEventListener(DemandEventType);
            await allocation.release();
            console.info('no offers received');
            return;
        }
    }, OFFER_TIMEOUT);

    demand.addEventListener(DemandEventType, async (proposalEvent) => {
        if (!jobRunning) {
            const proposal = proposalEvent.proposal;
            if (proposal.isInitial())
                await proposal.respond(account.platform).catch(() => { });
            else if (proposal.isDraft()) {
                const agreement = await Agreement.create(proposal.id, { logger });
                await agreement.confirm();
                if (topProvidersIds.includes(agreement.provider.id)) {
                    try {
                        jobRunning = true;
                        const result = await runJob(agreement);
                        // wait for payments to be processed
                        setTimeout(async () => {
                            demand.removeEventListener(DemandEventType);
                            await allocation.release();
                            console.log('writing results to result.json');
                            writeFileSync('result.json', JSON.stringify(result, null, 2));
                        }, 10000);
                    } catch (e) {
                        console.log(`provider ${offer.issuerId} failed`)
                        console.error(e);
                    } finally {
                        jobRunning = false;
                    }
                }
                else {
                    await agreement.terminate();
                    await proposal.reject('not in top providers');
                }
            } else
                await proposal.reject();
        }
    })
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
