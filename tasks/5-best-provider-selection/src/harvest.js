import { writeFileSync } from 'fs';
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
    DebitNoteEvent,
} from "yajsapi";
import { GftpStorageProvider } from "yajsapi/dist/storage/index.js"

const MAX_PROPOSALS = 10;
const logger = new ConsoleLogger();

async function runJob(agreement) {
    const activity = await Activity.create(agreement.id, { logger });
    const gftpStorageProvider = new GftpStorageProvider(logger);
    await gftpStorageProvider.init();
    const script = Script.create([
        new Deploy(),
        new Start(),
        new Run("/bin/sh", ["-c", "date +%s"]),
        new Run("/bin/sh", ["-c", "blender -b cubes.blend -E CYCLES -o /golem/output/cubes_####.png -f 1 -t 0"]),
        new Run("/bin/sh", ["-c", "date +%s"]),
    ]);
    const exeScript = script.getExeScriptRequest();
    const streamResult = await activity.execute(exeScript, undefined, 3600000);

    const results = [];
    for await (const result of streamResult)
        results.push(result);
    await gftpStorageProvider.close();
    await activity.stop();
    await agreement.terminate();
    return results;
}

async function main() {
    const vmPackage = Package.create({ imageHash: "dadcf728a4cc12a957b0fea625dedfcdb1a3d8ae9d6212ff532cd69e" });
    const accounts = await (await Accounts.create({ yagnaOptions: { apiKey: process.env.YAGNA_APPKEY } })).list();

    const account = accounts.find((account) => account?.platform === 'erc20-rinkeby-tglm');
    if (!account) throw new Error("There is no available account");
    const allocation = await Allocation.create({ account, logger });

    const demand = await Demand.create(vmPackage, [allocation], { logger });

    let noOfOffers = 0;
    const payments = await Payments.create({ logger });
    const offers = await new Promise((res) => {
        let offers = [];
        demand.addEventListener(DemandEventType, async (proposalEvent) => {
            const proposal = proposalEvent.proposal;
            if (proposal.isInitial())
                await proposal.respond(account.platform).catch(() => { });
            else if (proposal.isDraft()) {
                if (noOfOffers < MAX_PROPOSALS) {
                    noOfOffers++;
                    offers.push(proposal);
                    if (noOfOffers === MAX_PROPOSALS) {
                        demand.removeEventListener(DemandEventType);
                        res(offers);
                    }
                } else
                    await proposal.reject('no more offers needed');
            } else
                await proposal.reject('no more offers needed');
        })
    });

    const amounts = {};
    const processPayment = (event) => {
        if (event instanceof InvoiceEvent && event.invoice.agreementId in agreements) {
            if (!(event.invoice.agreementId in amounts))
                amounts[event.invoice.agreementId] = 0;
            amounts[event.invoice.agreementId] = parseFloat(event.invoice.amount);
            event.invoice.accept(event.invoice.amount, allocation.id).catch((e) => logger.warn(e));
        }
        if (event instanceof DebitNoteEvent) {
            if (!(event.debitNote.agreementId in amounts))
                amounts[event.debitNote.agreementId] = 0;
            amounts[event.debitNote.agreementId] = parseFloat(event.debitNote.totalAmountDue);
            event.debitNote.accept(event.debitNote.totalAmountDue, allocation.id).then(() => {
            }).catch((e) => logger.warn(e));
        }
    };
    payments.addEventListener(PaymentEventType, processPayment);

    const results = {};
    const agreements = [];
    const jobs = [];
    for (const offer of offers) {
        const agreement = await Agreement.create(offer.id, { logger });
        agreements.push(agreement.id);
        await agreement.confirm();

        const job = runJob(agreement).then((result) => {
            results[agreement.provider.id] = {
                providerName: agreement.provider.name,
                cost: amounts[agreement.id],
                timeTaken: parseInt(result[4].stdout.split('\n')[0]) - parseInt(result[2].stdout.split('\n')[0]),
            };
        });
        jobs.push(job);
    }

    await Promise.all(jobs);

    // wait for payments to be processed
    setTimeout(async () => {
        await allocation.release();
        await payments.unsubscribe();
        payments.removeEventListener(PaymentEventType, processPayment);
        console.log('writing results to providers.json');
        writeFileSync('providers.json', JSON.stringify(results, null, 2));
    }, 10000);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
