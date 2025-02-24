let w, h, isLandscape, isMobile, isSmallScreen, isMiddleScreen;

getSizes();

function getSizes() {
    w = window.innerWidth;
    h = window.innerHeight;

    isLandscape = w > h;
    isMobile = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
    isSmallScreen = document.body.clientWidth < 768;
    isMiddleScreen = document.body.clientWidth >= 768 && document.body.clientWidth <= 1024;

}
// const usage_surname_Range = [Infinity, -Infinity]
const usage_given_Range = [Infinity, -Infinity]

const area_range = [240, 40000]
// const scale_surname = d3.scaleLinear()
//     .range(area_range)
const scale_given = d3.scaleLinear()
    .range(area_range)


const english_lookup = {};
const character_lookup = {}; //all characters

const pinyinSyllables = new Set();

function parseData() {
    const hanziByEng = []
    for (const eng in english_lookup) {
        const d = {
            name: eng,
            children: [],
            // snu: false,
            // usage_surname: 0,
            usage_given: 0,
            usage_gender: 0
        };
        //reduce characters to check SNU, if all false, not to allow to search. 
        let _usage_gender = 0;
        for (const chara in english_lookup[eng].charas) {
            const _chara = english_lookup[eng].charas[chara];

            //sort tonesInEng
            if (_chara.tonesInEng_count > 1) _chara.tonesInEng = _chara.tonesInEng.sort((a, b) => (_chara.tone_name.indexOf(a) - _chara.tone_name.indexOf(b)) || (+a - +b));
            //calc
            // d.snu = d.snu || _chara.familychara
            d.children.push(safeStructuredClone(_chara))
            // d.usage_surname += _chara.usage_surname
            d.usage_given += _chara.usage_given
            _usage_gender += _chara.usage_given * _chara['NG']

        }
        d.usage_gender = d.usage_given ? _usage_gender / d.usage_given : 0;
        //add to english_lookup
        // english_lookup[eng].usage_surname = d.usage_surname
        english_lookup[eng].usage_given = d.usage_given
        english_lookup[eng].usage_gender = d.usage_gender

        // if (d.usage_surname >= 1) usage_surname_Range[0] = Math.min(d.usage_surname, usage_surname_Range[0])
        // usage_surname_Range[1] = Math.max(d.usage_surname, usage_surname_Range[1])
        if (d.usage_given >= 1) usage_given_Range[0] = Math.min(d.usage_given, usage_given_Range[0])
        usage_given_Range[1] = Math.max(d.usage_given, usage_given_Range[1])

        hanziByEng.push(d)
    }
    // scale_surname.domain(usage_surname_Range)
    scale_given.domain(usage_given_Range)

    return hanziByEng;
}


const hanzi_raw = d3.csv('./static/data/character_dictionary_withEng_name.csv', parseHanzi);
const surname_raw = d3.csv('./static/data/familyname.csv', parseSurname);
const famousnames_raw = d3.csv('./static/data/Chinese figures - Sheet1.csv', parseFamous);


function parseHanzi(d) {
    //character,meaning
    // pinyin_hanziDB,pinyin_qxk,pinyin_hanziDB_qxk,
    // pinyin_name,pinyin_givenname,pinyin_familyname,
    // pinyin,
    // tone,tone_name,tone_familyname,tone_givenname,
    // eng,eng_name,eng_familyname,eng_givenname
    // "SNU","SNI","NU","CCU","NG","NV","NW","NC"
    d.pinyin_notone = d.pinyin_notone.split('#')
    d.pinyin = d.pinyin.split('#')
    d.tone = d.tone.split('#')
    d.eng = d.eng.split('#')

    d.pinyin_name = d.pinyin_name === '' ? false : d.pinyin_name.split('#')
    d.tone_name = d.tone_name === '' ? false : d.tone_name.split('#')
    d.eng_name = d.eng_name === '' ? false : d.eng_name.split('#')

    d.pinyin_givenname = d.pinyin_givenname.split('#')
    d.tone_givenname = d.tone_givenname.split('#')
    d.eng_givenname = d.eng_givenname.split('#')

    // d.pinyin_surname = d.pinyin_familyname.split('#')
    // d.tone_surname = d.tone_familyname.split('#')
    // d.eng_surname = d.eng_familyname.split('#')
    delete d.pinyin_familyname;
    delete d.tone_familyname;
    delete d.eng_familyname;

    //uniq in surname and givenname, 
    //SNU: 2 and 3 mean that 1/100 and 1/1000 of people had this surname
    //NU: 2 and 3 mean that 1/100 and 1/1000 of people used this character in given name 
    // d['SNU'] = d['SNU'] === "NA" ? false : +d['SNU'] //1741
    d['NU'] = +d['NU']

    //name gender (difference in proportions of a character used by male vs. female)
    //-1 female -0- male 1
    d['NG'] = d['NG'] === "NA" ? false : +d['NG']
    // d.familychara = d['SNU'] && d['SNU'] < 4.2924

    d.fontcolor = '#000';

    // if (d['NU'] == 6 && (!d['SNU'])) return d;
    if (d['NU'] == 6 && (!d['NG'])) return d;
    // if(d['NU'] >5)return d;
    d.usage_given = calculateUsagePerMillion(d['NU'])
    // d.usage_surname = d['SNU'] ? calculateUsagePerMillion(d['SNU']) : 0



    // d.eng.forEach(eng => {
    if (!d.eng_name) return d;
    d.eng_name.forEach(eng => {
        pinyinSyllables.add(eng);
        if (!english_lookup[eng]) english_lookup[eng] = { name: eng, charas: {} };
        //every eng only has one chara: 强
        if (!english_lookup[eng].charas[d.character]) english_lookup[eng].charas[d.character] = Object.assign({ tonesInEng_count: 0, tonesInEng: [] }, d);


        d.pinyin_notone.forEach((py, i) => {
            const _tone = d.tone[i];
            // if(py === eng){
            if ((py === eng) && _tone != "0") {
                english_lookup[eng].charas[d.character].tonesInEng_count++;
                english_lookup[eng].charas[d.character].tonesInEng.push(_tone)
            }
        })
    })

    character_lookup[d.character] = d;



    return d;
}

function parseSurname(d) {
    // surname,n,ppm
    d.n = +d.n;
    d.ppm = +d.ppm;
    return d;
}

function parseGiven(d) {
    // character,
    //n.male,n.female,name.ppm,corpus.ppm,
    //name.gender,
    //name.uniqueness,corpus.uniqueness,
    //name.valence,name.warmth,name.competence
    let t = {};
    t.character = d.character;
    t.ppm = +d['name.ppm'];

    return t;
}

function parseFamous(d) {
    //surname   givenname   intro   wiki_link
    return d;
}