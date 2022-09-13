module.exports = class Publisher {

    //Set time in seconds
    constructor(publisherName, interval){
        this.publisherName = publisherName;
        this.interval = interval;
        this.intervalId = this.startPublishing(publisherName, interval);
    }

    startPublishing(publisherName, interval) {
        let intervalId = setInterval(() => {
            console.log(`${publisherName} - ${intervalId}: Checking test`);
        }, interval * 1000);
        console.log("Started");
        return intervalId;
    }

    stopPublishing(intervalId) {
        clearInterval(intervalId)
    }
}


// let samplePub2 = new Publisher("Publ2", 1);