const graphContainer = d3.select('.graph');
const searchFContainer = d3.select('#searchbar-f');
const searchGContainer = d3.select('#searchbar-g');
const randomBtn = d3.select('#btn-randomname');

const navModal = new bootstrap.Modal(document.getElementById('navi-modal'))
navModal.show()
// $(document).ready(function() {
//     $('#navi-modal').modal('show');
// });


Promise.all([hanzi_raw, famousnames_raw])
    .then(([hanzi, famousnames]) => {

        // hanzi.sort((a,b) => a['NU'] - b['NU'])
        console.log(hanzi)
        // console.log(hanzi.filter(d =>d['SNU'] && d['SNU']<3 ))
        // const hanzi_NU3 = hanzi.filter(d => d['NU'] <=5)
        // console.log(hanzi_NU3)


        const hanziByEng = parseData()


        // console.log(hanziByEng.find(d => d.name ==="yang"))
        // hanziByEng.sort((a,b) => b.usage_given - a.usage_given)
        // console.log(hanziByEng, usage_given_Range, usage_surname_Range)
        const updateVis = treeMap(graphContainer, hanziByEng)()
        updateVis.filter({ aniT: 0 })



        const searchGList = hanziByEng.map(d => d.name);
        // const searchFList = hanziByEng.filter(d => d.snu).map(d => d.name);
        getSearch(searchGList, searchGContainer, (list) => {

            currentSearch.given = list;
            updateVis.filter()
            updatePopup()

        }, "given name");
        // getSearch(searchFList, searchFContainer, (list) => {
        //     currentSearch.family = list;
        //     updateVis.filter()
        //     updatePopup()

        // }, "surname");

        let usedIndexes = [];
        randomBtn.on('click', function() {
            let randomIndex;
            // If all items have been shown, reset the usedIndexes array
            if (usedIndexes.length === famousnames.length) {
                usedIndexes = [];
            }
            // Generate a random index until we find one that hasn't been used yet
            do {
                randomIndex = Math.floor(Math.random() * famousnames.length); // Generate a random index
            } while (usedIndexes.includes(randomIndex));

            // Add the selected index to the usedIndexes array
            usedIndexes.push(randomIndex);

            currentSearch.famousIndex = randomIndex
            const value = famousnames[currentSearch.famousIndex];

            document.getElementById('searchbar-g').querySelector('input').dispatchEvent(new CustomEvent('triggerSearchEvent', { detail: value.givenname }))
            // document.getElementById('searchbar-f').querySelector('input').dispatchEvent(new CustomEvent('triggerSearchEvent', { detail: value.surname }))

            updatePopup(value)
        })

    })