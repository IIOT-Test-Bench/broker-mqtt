class Publisher {

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

let range = 5
let samplePubs = new Array(range);
for(let i=0; i<range; i++){
    samplePubs[i] = new Publisher(`Publ ${i}`, 1);
}

setTimeout(() => {
    for(let i=0; i<range; i++){
        samplePubs[i].stopPublishing(samplePubs[i].intervalId);
        // console.log(samplePubs[i].intervalId);
    }
}, 5000);
// let samplePub2 = new Publisher("Publ2", 1);