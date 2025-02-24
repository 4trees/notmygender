const graphCoverContainer = d3.select('#graph-cover-about');


Promise.all([hanzi_raw, surname_raw])
    .then(([hanzi, surnames]) => {

        const hanziByEng = parseData()


        console.log(hanziByEng)

        //set up cover
        const updateCover = treeMap(graphCoverContainer, hanziByEng)()
        updateCover.falling()


        async function checkAudioFiles(characterLookup, batchSize = 50) {
    const tasks = [];

    // Build the list of files to check
    Object.values(characterLookup).forEach(d => {
        d.pinyin_notone.forEach((pinyin, i) => {
            const tone = d.tone[i];
            if (tone === "0") return; // Skip if tone is "0"
            const file = `./static/mp3/${pinyin}${tone}.mp3`;
            tasks.push(file);
        });
    });

    // Process tasks in batches
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        await Promise.all(
            batch.map(file =>
                fetch(file, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            console.log(`File not found: ${file}`);
                        }
                    })
                    .catch(error => {
                        console.error(`Error accessing file: ${file}`, error);
                    })
            )
        );
    }
}

// Example usage
checkAudioFiles(character_lookup, 50);


    })