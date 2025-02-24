// const graphTreesContainer = d3.select('#graph-trees');
const graphCoverContainer = d3.select('#graph-cover');
const btnRandomChara = d3.select('#btn-randomchara');
const randomCharaContainer = d3.select('#randomchara');
const randomCharaPinyinContainer = d3.select('#randomchara-pinyin');
const randomCharaBGContainer = d3.select('#randomchara-bg');
const countNamechara = d3.selectAll('.count-namechara')
const countNamepinyin = d3.selectAll('.count-namepinyin')
const countYi = d3.select('#count-yi')
const graphPieContainer = d3.select('#graph-pie')
const topFivePerContainer = d3.select('#topFivePer')
const pieHintContainer = d3.select('.pie-hint')

let graphcase_f;
let currentRandomIndex = 0;

$(window).on('beforeunload', function() {
    window.scrollTo({
        top: 0,
        behavior: 'instant' // This may not be supported; see note below
    });
});

Promise.all([hanzi_raw, surname_raw, famousnames_raw])
    .then(([hanzi, surnames, famousnames]) => {
        //sounds
        d3.selectAll('.sound')
            .style('background-color', function() {
                const tone = d3.select(this).node().dataset.tone
                return toneColor(tone);
            })
            .on('click', function() {
                const tone = d3.select(this).node().dataset.tone
                const audio = new Audio(`./static/mp3/a${tone}.mp3`)
                audio.play()

            })
        //surname pie chart
        const pop = d3.sum(surnames, d => d.n)
        const surnamesToDraw = []
        let topFivePer = 0;
        surnames.forEach((d, i) => {
            d.color = '#a2a9b0'
            if (character_lookup[d.surname]) {
                const tones = character_lookup[d.surname].tone_surname[0]
                d.color = toneColor(tones[0])
            }
            d.per = d.n / pop;
            d.show = false;
            // if(d.per > 0.01){
            if (i < 10) {
                d.show = true;
                d.eng = character_lookup[d.surname].eng_surname[0]
                surnamesToDraw.push(d)
            }
            if (i < 5) topFivePer += d.per;
        })
        const remainSurnames = surnames.filter(d => !d.show)
        const remainSurnames_n = d3.sum(remainSurnames, d => d.n)
        const totalAngle = Math.PI * 2 * (1 - remainSurnames_n / pop);
        // surnamesToDraw.push({surname: `rest ${remainSurnames.length} surnames`,n:remainSurnames_n})
        pieChart(graphPieContainer, surnamesToDraw).startAngle(-totalAngle / 2).endAngle(totalAngle / 2)()
        topFivePerContainer.html(d3.format(".0%")(topFivePer))

        //fill info
        const characters = Object.keys(character_lookup)
        const characters_count = characters.length;
        const english_count = Object.keys(english_lookup).length;
        // console.log(characters_count)
        countNamechara.html(d3.format(",")(characters_count))
        countNamepinyin.html(english_count)

        countYi.html(Object.values(english_lookup['yi'].charas).filter(d => d.tonesInEng[0] === "4").length)

        //set up random chara func
        getRandomChara("茜") //

        btnRandomChara.on('click', function() {
            getRandomChara()
            btnRandomChara.classed('blinking',false)
        })

        function getRandomChara(_chara) {
            let chara;
            if (!_chara) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * characters_count); // Generate a random index
                } while (randomIndex === currentRandomIndex);

                currentRandomIndex = randomIndex
                chara = characters[randomIndex];
            } else {
                chara = _chara;
            }
            const chara_info = character_lookup[chara]
            randomCharaContainer.html(chara)

            // deal with typical cases:
            //typically used in given names
            //when used as a surname
            const typicalgivenpinyin = chara_info.pinyin_name[0] !== chara_info.pinyin_givenname[0] ? chara_info.pinyin_givenname[0] : false;
            const typicalsurpinyin = chara_info.pinyin_name.join('') !== chara_info.pinyin_surname.join('') ? chara_info.pinyin_surname[0] : false;

            const pinyinData = [];
            chara_info.pinyin_name.forEach((d, i) => {
                const tone = chara_info.tone_name[i];
                let typical = false;
                if (typicalgivenpinyin && (typicalgivenpinyin === d)) typical = 'typically used in given names';
                if (typicalsurpinyin && (typicalsurpinyin === d)) typical = 'when used as a surname';
                pinyinData.push({
                    tone: tone,
                    color: toneColor(tone),
                    audio: new Audio(`./static/mp3/${chara_info.pinyin_notone[i]}${tone}.mp3`),
                    text: d,
                    typical: typical,
                })
            })

            randomCharaPinyinContainer.selectAll('.strips').data(pinyinData)
                .join('div').attr('class', 'position-relative pinyin-box px-3 strips')
                .html((d, i) => `
                    <div class="pinyin-bg px-2 text-white" style="margin-top:calc(1.3em * ${+d.tone-1} - 0.7em);background-color: ${d.color};">
                        <div class="position-relative d-flex align-items-center justify-content-center" style="padding:0.2em 0;">
                            <div class="lh-1 d-flex align-items-center">${d.text}</div>
                            <button class="btn-audio-play btn btn-link btn-none p-0 m-0 lh-1 ms-2 text-white" type="button">
                                <i class="icon-volume"></i>
                            </button>
                        </div>
                    </div>
                    ${d.typical ? `<div class="text-muted lh-1 fs-7 position-absolute" style="calc(1.3em * ${+d.tone-1} - 0.7em);background-color:#fff">${d.typical}</div>`: ""}
                    `)

            randomCharaPinyinContainer.selectAll('.btn-audio-play')
                .on('click', function(d, i) {
                    pinyinData[i].audio.play()
                })

            // randomCharaBGContainer.
            drawCharaBG(chara_info, randomCharaBGContainer)

        }


        const hanziByEng = parseData()


        // console.log(hanziByEng)

        //set up cover
        const updateCover = treeMap(graphCoverContainer, hanziByEng)()
        updateCover.cover()

        //set up scrolly
        // const allFList = hanziByEng.filter(d => d.snu).map(d => d.name);

        // updateVis = treeMap(graphTreesContainer, hanziByEng)()

        const graphcase1 = treeMap(d3.select('.graph-case1'), hanziByEng)()
        graphcase1.tonecase('yi', "4")
        graphcase1.hideRoots(['surname', 'given'])

        const graphcase2 = treeMap(d3.select('.graph-case2'), hanziByEng)()
        graphcase2.tonecase('yi')
        graphcase2.hideRoots(['surname', 'given'])

        const graphcase3 = treeMap(d3.select('.graph-case3'), hanziByEng)()
        currentSearch.given = ['yi'];
        graphcase3.filter({ noHover: true })
        graphcase3.hideRoots(['surname', 'given'])

        const graphcase4 = treeMap(d3.select('.graph-case4'), hanziByEng)()
        currentSearch.given = ['yu', 'za'];
        graphcase4.filter({ noHover: true })
        graphcase4.hideRoots(['surname'])

        // const top10Flist = surnamesToDraw.map(d => character_lookup[d.surname].eng_surname[0]);
        graphcase_f = treeMap(d3.select('.graph-case5'), hanziByEng)()
        const currentSelectedSurname = surnamesToDraw[0];
        currentSearch.family = [currentSelectedSurname.eng];
        currentSearch.given = null;
        graphcase_f.filter({ noHover: true })
        graphcase_f.hideRoots(['given'])
        let second = "",
            isSlightly = false;
        const eng_usage = d3.format(",")(english_lookup[currentSelectedSurname.eng].usage_surname.toFixed(0));
        const surname_usage = d3.format(",")(character_lookup[currentSelectedSurname.surname].usage_surname.toFixed(0));
        if (eng_usage === surname_usage) {
            isSlightly = true;
            second = `this total remains close at ${eng_usage} per million.`
        } else {
            const isSlightly = Math.abs(english_lookup[currentSelectedSurname.eng].usage_surname - character_lookup[currentSelectedSurname.surname].usage_surname) < 200
            second = `the total rises${isSlightly ? ' slightly':""} to <span class="fw-bold">${eng_usage}</span> per million people.`
        }
        pieHintContainer.html(`Taking "<span class="text-capitalize">${currentSelectedSurname.eng}</span>" as an example, <span class="fw-bold">${d3.format(".0%")(currentSelectedSurname.per)}</span> of the population (<span class="fw-bold">${surname_usage}</span> per million) use "<span class="fw-bold">${currentSelectedSurname.surname}</span>" as their surname. Including other${isSlightly ? ' rare':""} surnames that share the same syllable, ${second}`)


        const graphcase6 = treeMap(d3.select('.graph-case6'), hanziByEng)()
        currentSearch.family = ['liu'];
        currentSearch.given = ['cixin'];
        graphcase6.filter({ noHover: true })
        // top three most common given character : ['yu','ying','li']
        // console.log(Object.values(character_lookup).sort((a,b) => b.usage_given - a.usage_given))


    })