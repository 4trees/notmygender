// const colors = ['#a2a9b0', '#e25f8f', '#d4b237', '#2faf76', '#6582e0' ];//alter

// const colors = ['#a2a9b0', '#d4b237', '#EC603D', '#c677e2', '#4589ff', ];//good 
// const colors = ['#a2a9b0', '#d4b237', '#EC603D', '#c677e2', '#6582e0', ];//good too

// const colors = ['#a2a9b0', '#ef7f74', '#e0bb8b', '#8bc4c6', '#a3b9e2' ];
// const colors = ['#a2a9b0', '#d4b237', '#ff6666', '#c677e2', '#6582e0', ];//not sure: more pinkish

// const colors = ['#a2a9b0', '#e25f8f', '#d4b237', '#00a38a', '#6582e0', ];//good but from copy
// const colors = ['#a2a9b0', '#d4b237', '#ea4b73', '#2faf76', '#6582e0', ]; //alter


// const colors = ['#a2a9b0', '#d4b237', '#f595bf', '#99ccff', '#96c26d', ];//ice cream

// const colors = ['#ffbe4f','#fff','#0ea7b5'] //f8f8f8
// const colors = ['#ffa3bf','#fed9b7','#fff','#aae3ea','#2db3d4']
// const colors = ['#ff6289','#ffc2cd','#fff','#83d0c9','#009688'] 
const colors = ['#ff6289','#ff93ac','#ffc2cd','#fff','#b8e8ff','#8cc2ff','#7fa1ff'] 

function structuredCloneFallback(value) {
    return JSON.parse(JSON.stringify(value));
}

// Use structuredClone if available, otherwise fallback
function safeStructuredClone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return structuredCloneFallback(value);
}

// const tones = ["0", "1", "2", "3", "4"]

// const toneColor = d3.scaleOrdinal()
//     .range(colors)
//     .domain(tones)
const genderColor = d3.scaleLinear()
    .range(colors)
    // .domain([-1,0,1])
    // .domain([-1,-0.5,0,0.5,1])
    .domain([-1,-0.75,-0.5,0,0.5,0.75,1])

// Function to map the gender value to a label
function genderValueToLabel(genderValue) {
    if (genderValue <= -0.5) {
        return "Strongly Female";
    } else if (genderValue < 0 && genderValue > -0.5) {
        return "Slightly Female";
    } else if (genderValue >= -0.05 && genderValue <= 0.05) {
        return "Neutral";
    } else if (genderValue > 0 && genderValue < 0.5) {
        return "Slightly Male";
    } else {
        return "Strongly Male";
    }
}


const treePath1 = `M235.5,9.6c0,0,118.1,33.8,174,105.5c4.2-57,61.2-98.1,61.2-98.1c-100.2,97,12.7,195.1,0,288
    c96-91.8,213.1-73.8,213.1-73.8c-293.2,29.5-283.7,417-178.9,566.8c2.5,3.5-56.7,12-105.4,12c-50.4,0-100.5-8.6-99.5-12
    c6.2-21.8,12-39.7,16.9-62.2c5.9-26.9,8.4-62.7,3-105.9c-8.5-67.5-32.3-110-63-159c-19.9-31.8-52.2-78.5-140.6-112
    c0,0,140.3,15.8,204.6,157.2C431.6,347.1,490.7,130.9,235.5,9.6L235.5,9.6z`
// const treePath1 = `M235.46,1.57s118.13,33.75,174.04,105.48c4.22-56.96,61.18-98.09,61.18-98.09-100.2,97.04,12.66,195.14,0,287.96,95.99-91.77,213.07-73.84,213.07-73.84-293.24,29.54-300.62,488.36-170.88,572.75h-171.94c-108.64-133.96,44.3-326.99-224.67-445.12,0,0,140.29,15.82,204.63,157.17C431.64,339.1,490.71,122.87,235.45,1.57h0Z`;

function drawCharaBG(chara,dom) {
    const nodeDomSize = dom.node().getBoundingClientRect();
    const r = nodeDomSize.width/2;
    const count_tones = chara.tone_name.length;
    const paths = []
    const s_angle = -Math.PI * 0.65;
    const e_angle = Math.PI * 0.65;
    if (count_tones === 1) {
        const s = [Math.sin(s_angle) * r, -Math.cos(s_angle) * r]
        const e = [Math.sin(e_angle) * r, -Math.cos(e_angle) * r]
        const path = `M${s[0]} ${s[1]} A ${r} ${r} 0 1 1 ${e[0]} ${e[1]} A${r} ${r} 0 0 0 0 ${r} A${r} ${r} 0 0 0 ${s[0]} ${s[1]}z`
        const color = toneColor(chara.tone_name[0]);
        paths.push({ path: path, fill: color })
    } else {
        const gap_angle = (e_angle - s_angle) / count_tones;
        let _s_angle = s_angle;
        chara.tone_name.forEach((tone, i) => {
            let _path;
            const _s = [Math.sin(_s_angle) * r, -Math.cos(_s_angle) * r]
            const _e = [Math.sin(_s_angle + gap_angle) * r, -Math.cos(_s_angle + gap_angle) * r]
            switch (i) {
                case 0:
                    _path = `M${_s[0]} ${_s[1]} A ${r} ${r} 0 0 1 ${_e[0]} ${_e[1]} L 0 ${r} A${r} ${r} 0 0 0 ${_s[0]} ${_s[1]}z`
                    break;
                case (count_tones - 1):
                    _path = `M${_s[0]} ${_s[1]} A ${r} ${r} 0 0 1 ${_e[0]} ${_e[1]} A${r} ${r} 0 0 0 0 ${r} L ${_s[0]} ${_s[1]}z`
                    break;
                default:
                    _path = `M${_s[0]} ${_s[1]} A ${r} ${r} 0 0 1 ${_e[0]} ${_e[1]} L 0 ${r} L ${_s[0]} ${_s[1]}z`
            }
            const _color = toneColor(chara.tone_name[i])
            paths.push({ path: _path, fill: _color })
            _s_angle += gap_angle;
        })
    }
    dom.selectAll('svg').data([0]).join('svg')
      .attr('width', nodeDomSize.width).attr('height', nodeDomSize.height)
      .attr('viewBox', `${-nodeDomSize.width/2} ${-nodeDomSize.height/2} ${nodeDomSize.width} ${nodeDomSize.height}`)
      .selectAll('path').data(paths)
      .join('path').attr('d', d => d.path).attr('fill', d => d.fill)
    
}

function splitPinyin(pinyin) {
    function helper(start) {
        if (start === pinyin.length) return [
            []
        ]; // Base case: reached the end of the string

        const results = [];
        for (let end = start + 1; end <= pinyin.length; end++) {
            const syllable = pinyin.slice(start, end);

            if (pinyinSyllables.has(syllable)) {
                const rest = helper(end); // Recursively find the rest of the syllables
                for (const r of rest) {
                    const combinedResult = [syllable, ...r];
                    if (combinedResult.length <= 3) { //limit to max three items
                        results.push(combinedResult);
                    }
                }
            }

        }

        results.sort((a, b) => a.length - b.length);
        const hasShorterResults = results.some(result => result.length < 3);
        return hasShorterResults ? results.filter(result => result.length < 3) : results;
        // return results;
    }

    return helper(0);
}

function calculateUsagePerMillion(NU) {
    const proportion = Math.pow(10, -NU) - Math.pow(10, -6);
    return proportion * 1000000;
}