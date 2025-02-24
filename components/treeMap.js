const currentSearch = { family: null, given: null, famousIndex: 0 }

const treeMap = (_, clusterData) => {
    const node = _;
    let _width = 0;
    let _height = 0;
    let _draw;
    // const [view_w, view_h] = [_.clientWidth, _.clientHeight];

    // clusterData.sort((a, b) => b.length - a.length);
    // let maxTone = -Infinity;
    let currentHoverChara;

    const font_size = [24, 16];
    // const min = font_size[0] / 2 + 4
    const min = font_size[0]

    const labelSize = { w: font_size[1] * 0.6, h: font_size[1] * 1.2 }

    // const stemR = [20, 40];
    const StemCanvasSize = 800;
    let aniT = 0;

// console.log(clusterData)
    const _drawData = [];
    const _drawData_lookup = {}

    clusterData.forEach(d => {

        //usage 

        d.usage_given_r = Math.sqrt(scale_given(d.usage_given))
        // d.usage_surname_r = Math.sqrt(scale_surname(d.usage_surname))
        d.usage_given_path = `
            m${-d.usage_given_r} 0 
            a ${d.usage_given_r} ${d.usage_given_r/5} 0 0 0 ${d.usage_given_r * 2} 0 
            a ${d.usage_given_r} ${d.usage_given_r/5} 0 0 0 ${-d.usage_given_r*2} 0`;
        // d.usage_surname_path = `
        //     m${-d.usage_surname_r} 0 
        //     a ${d.usage_surname_r} ${d.usage_surname_r/5} 0 0 0 ${d.usage_surname_r * 2} 0 
        //     a ${d.usage_surname_r} ${d.usage_surname_r/5} 0 0 0 ${-d.usage_surname_r*2} 0`;
        d.usages = [
            // { type: 'surname', path: d.usage_surname_path, width: 3, fill: 'none', stroke: "#000" },
            { type: 'given', path: d.usage_given_path, width: 1, fill: 'none', stroke: "#000" }
        ]


        //gender
        d.usage_given_text = d.usage_given >= 1 ? d3.format(",")(d.usage_given.toFixed(0)) : "<1"
        // d.usage_surname_text = d.usage_surname >= 1 ? d3.format(",")(d.usage_surname.toFixed(0)) : "<1"
        d.usage_gender_text = `${genderValueToLabel(d.usage_gender)} (${d.usage_gender.toFixed(2)})`
        //info
        d.text = [
            // { text: `surname: <tspan class="fw-bold">${d.usage_surname_text}</tspan>` },
            // { text: `given name: <tspan class="fw-bold">${d.usage_given_text}</tspan>` },
            { text: `usage: <tspan class="fw-bold">${d.usage_given_text}</tspan>` },
            { text: `gender: <tspan class="fw-bold">${d.usage_gender_text}</tspan>` },
        ];

        //characters
        const count = d.children.length;
        if (count === 0) return;

        //sort characters
        // d.children.forEach(chara => {
        //     chara.tonesInEng.sort((a, b) => +a - +b) //from 0 to 4

        // })
        // d.children.sort((a, b) => (a.tonesInEng_count - b.tonesInEng_count) || (+a.tonesInEng[0] - +b.tonesInEng[0])) //from less tones to more,from 0 to 4
        d.children.sort((a, b) => a['NG'] - b['NG'])

        //create dummy points 
        const pos_count = count === 1 ? count : Math.floor(count * 1.2 + 1);
        const children = [];
        for (var i = 1; i <= pos_count; i++) {
            children.push({ r: min - 2.5 });
        }
        d3.packSiblings(children);
        children.sort((a, b) => (Math.ceil(a.y) - Math.ceil(b.y)) || (Math.ceil(a.x) - Math.ceil(b.x))) //from top to bottom, from left to right



        d.children.forEach((chara, i) => {
            const ch = children[i]
            chara.x = ch.x;
            chara.y = ch.y;
            chara.fontsize = font_size[0];
            chara.r = min
            chara.aniT = 500 + Math.random() * 1000;
            chara.rotate = Math.random() * 90 + 90
            // chara.gender_rotate = d.gender_rotate
            chara.gender_rotate = chara['NG'] * 90;
            // chara.fontsize = font_size[0]
            // chara.r = chara.fontsize * 0.9
            // chara.r = min
            // chara.fontsize = font_size[1]
            // console.log('chara.r',chara.r)

            const count_tones = chara.tonesInEng_count;
            chara.paths = []
            const s_angle = -Math.PI * 0.65;
            const e_angle = Math.PI * 0.65;

            
            // if (count_tones === 1) {
                const s = [Math.sin(s_angle) * chara.r, -Math.cos(s_angle) * chara.r]
                const e = [Math.sin(e_angle) * chara.r, -Math.cos(e_angle) * chara.r]
                const path = `M${s[0]} ${s[1]} A ${chara.r} ${chara.r} 0 1 1 ${e[0]} ${e[1]} A${chara.r} ${chara.r} 0 0 0 0 ${chara.r} A${chara.r} ${chara.r} 0 0 0 ${s[0]} ${s[1]}z`
            //     const color = toneColor(chara.tonesInEng[0]);
                const color = genderColor(chara['NG']);
                chara.paths.push({ path: path, color: color, fill: color })
            // } else {
            //     const gap_angle = (e_angle - s_angle) / count_tones;
            //     let _s_angle = s_angle;
            //     chara.tonesInEng.forEach((tone, i) => {
            //         let _path;
            //         const _s = [Math.sin(_s_angle) * chara.r, -Math.cos(_s_angle) * chara.r]
            //         const _e = [Math.sin(_s_angle + gap_angle) * chara.r, -Math.cos(_s_angle + gap_angle) * chara.r]
            //         switch (i) {
            //             case 0:
            //                 _path = `M${_s[0]} ${_s[1]} A ${chara.r} ${chara.r} 0 0 1 ${_e[0]} ${_e[1]} L 0 ${chara.r} A${chara.r} ${chara.r} 0 0 0 ${_s[0]} ${_s[1]}z`
            //                 break;
            //             case (count_tones - 1):
            //                 _path = `M${_s[0]} ${_s[1]} A ${chara.r} ${chara.r} 0 0 1 ${_e[0]} ${_e[1]} A${chara.r} ${chara.r} 0 0 0 0 ${chara.r} L ${_s[0]} ${_s[1]}z`
            //                 break;
            //             default:
            //                 _path = `M${_s[0]} ${_s[1]} A ${chara.r} ${chara.r} 0 0 1 ${_e[0]} ${_e[1]} L 0 ${chara.r} L ${_s[0]} ${_s[1]}z`
            //         }
            //         const _color = toneColor(tone)
            //         chara.paths.push({ path: _path, color: _color, fill: _color })
            //         _s_angle += gap_angle;
            //     })
            // }

        })

        const _packTones = d3.packEnclose(children);
        d.x = _packTones.x
        d.y = _packTones.y
        d.r0 = _packTones.r
        d.r = Math.max(d.r0 + labelSize.h, labelSize.h * 4)

        // deduct children position
        d.children.forEach(chara => {
            chara.x -= d.x;
            chara.y -= (d.y - labelSize.h * 0.5);
        })
        _drawData.push(d)
    })

    _drawData.sort((a, b) => b.name.localeCompare(a.name))
    // d3.packSiblings(clusterData)
    pack(_drawData);

    //calc stem and save position

    _drawData.forEach(d => {

        d.stemScale = d.r / StemCanvasSize;
        // d.stemX = -d.r / 2 + d.r * 0.03 //adjust for gravity center
        d.stemX = -d.r / 2
        d.stemY = 0;
        d.text_x = 0
        d.text_y = d.r - font_size[1] * 0.35
        // d.text_y = Math.max(d.r, d.r * 0.9 + font_size[1])
        d.info_x = d.text_x + Math.max(d.r * 0.15, font_size[1] * 1)
        // d.info_y = d.r - Math.max(d.usage_given_r / 5, d.usage_surname_r / 5, labelSize.h)
        d.info_y = d.r - Math.max(d.usage_given_r / 5,labelSize.h)
        d.info_y -= font_size[1] * 0.75 * 2
        //save position
        d.x0 = d.x;
        d.y0 = d.y;

        //save parent xy
        d.children.forEach(chara => {
            chara.parentX = d.stemX;
            chara.parentY = d.text_y + chara.r - Math.random() * 20;
        })

        _drawData_lookup[d.name] = d;

    })


    // console.log(_drawData)
    // console.log(d3.extent(_drawData, d => d.children.length))
    draw()


    function draw() {
        let [view_w, view_h] = [_width || node.node().clientWidth, _height || node.node().clientHeight];


        const svg = node.selectAll('svg').data([0])
            .join('svg').attr('class', 'svg')
            .attr('width', view_w).attr('height', view_h)


        const landscape = svg.selectAll('.landscape').data([0]).join('g')
            .attr('class', 'landscape')

        const clusterRoots = landscape.selectAll('.clusterroots').data([0]).join('g')
            .attr('class', 'clusterroots')

        const clusterlinks = landscape.selectAll('.clusterlinks').data([0]).join('g')
            .attr('class', 'clusterlinks')


        const clusters = landscape.selectAll('.clusters').data([0]).join('g')
            .attr('class', 'clusters')

        const clusterInfos = landscape.selectAll('.clusterInfos').data([0]).join('g')
            .attr('class', 'clusterInfos')


        const update = {};
        update.vis = (drawClusterData, drawLinkData, offset) => {
            // 

            const clusterLink = clusterlinks.selectAll('.cluster-link').data(drawLinkData || [])
                .join('path').attr('class', d => `cluster-link`)
                .attr('stroke', '#ebeced')
                .attr('fill', 'none')
                .attr('d', d => `M${d.map(e => `${e.x} ${e.y}`).join('L')}`)
                .attr('stroke-width', 0)
            clusterLink.transition().duration(aniT / 3 * 2).delay(aniT / 3)
                .attr('stroke-width', min / 3)

            const roots = clusterRoots.selectAll('.roots').data(drawClusterData, d => d.name)
                .join('g').attr('class', 'roots')
            roots.transition().duration(aniT)
                .attr("transform", d => `translate(${d.x},${d.y})`)

            roots.selectAll('.root').data(d => [d])
                .join('g').attr('class', 'root')
                .attr('transform', d => `translate(${d.text_x}, ${d.r})`)
                .selectAll('.rootpath').data(d => d.usages)
                .join('path').attr('class', 'rootpath')
                .attr('d', d => d.path)
                .attr('fill', d => d.fill)
                // .attr('fill-opacity', 0.8)
                .attr('stroke-width', d => d.width)
                .attr('stroke', d => d.stroke)

            // roots.selectAll('.root_gender').data(d => [d])
            //     .join('path').attr('class', 'root_gender')
            //     .attr('transform', d => `translate(${d.text_x}, ${d.r})`)
            //     .attr('d', d => d.gender_path)
            //     .attr('fill', 'none')
            //     .attr('stroke', '#23170c')
            //     .attr('stroke-width', 1)
            const clusterInfo = clusterInfos.selectAll('.cluster-info').data(drawClusterData, d => d.name)
                .join('g').attr('class', 'cluster-info')
                .attr('transform', d => `translate(${d.info_x + d.x}, ${d.info_y + d.y})`)
                .attr('font-size', font_size[1] * 0.75)
                .attr('opacity', 0)

            clusterInfo.selectAll('.cluster-info-text').data(d => d.text)
                .join('text').attr('class', 'cluster-info-text')
                .attr('y', (d, i) => i * font_size[1] * 0.75)
                .html(d => d.text)
                .attr('stroke-width',2)
                .attr('stroke','#fff')
                .attr('paint-order', 'stroke')


            const cluster = clusters.selectAll('.cluster').data(drawClusterData, d => d.name)
                .join('g').attr('class', d => `cluster`)
            cluster.transition().duration(aniT)
                .attr("transform", d => `translate(${d.x},${d.y})`)


            // cluster.selectAll('.bg_cluster').data(d => [d])
            //     .join('circle').attr('class', 'bg_cluster')
            //     .attr('r', d => d.r)
            //     .attr('fill', "none")
            //     .attr('stroke-width', 1)
            //     .attr('stroke', '#a2a9b0')

            const stem = cluster.selectAll('.stem').data(d => [d])
                .join('path').attr('class', 'stem')
                .attr('d', treePath1)
                .attr('fill', '#23170c')
                .attr('transform', d => `translate(${d.stemX}, 0) scale(${d.stemScale})`)
            stem.transition().duration(aniT)
                .attr('transform', d => `translate(${d.stemX}, ${d.stemY}) scale(${d.stemScale})`)


            const clusterName = cluster.selectAll('.cluster-name').data(d => [d])
                .join('g').attr('class', 'cluster-name')
            clusterName.transition().duration(aniT)
                .attr('transform', d => `translate(${d.text_x}, ${d.text_y-labelSize.h*0.3})`)

            const clusterName_bg = clusterName.selectAll('.cluster-name-bg').data(d => [d])
                .join('path').attr('class', 'cluster-name-bg')
                // .attr('fill', "#f1f3f4")
                .attr('fill', d => genderColor(d.usage_gender))


            clusterName.selectAll('.cluster-text').data(d => [d])
                .join('text').attr('class', 'cluster-text')
                .text(d => d.name)
                .attr('text-anchor', 'middle').attr('font-weight', 'bold')
                .attr('font-size', font_size[1]).attr('fill', "#000")

            clusterName_bg.each(function(d, i) {
                // Select the corresponding text element to measure its width
                const textElement = d3.select(this.parentNode).select('.cluster-text').node();
                const textElement_box = textElement.getBBox();
                const textWidth = textElement_box.width;
                const textHeight = textElement_box.height;

                // Set the path to form a rectangle behind the text
                const padding = 5; // Add padding around the text as desired
                const bgWidth = Math.max(0.3 * d.r, textWidth + padding * 2);
                const bgHeight = textHeight + padding / 3 * 2;

                // Adjust the background path based on text dimensions and position
                d3.select(this)
                    .attr('d', `m${-bgWidth/2} ${textElement_box.y} h${bgWidth} v${bgHeight} h${-bgWidth} Z`)
            });


            const chara = cluster.selectAll('.chara').data(d => d.children, e => e.character)
                .join('g').attr('class', d => `chara`)
            chara.transition().duration(aniT)
                .attr("transform", d => `translate(${d.x},${d.y})`)


            const charaBg = chara.selectAll('.bg_charas').data(d => [d])
                .join('g').attr('class', 'bg_charas')
            // .attr("transform", d => `rotate(${d.gender_rotate})`)


            charaBg.selectAll('.bg_chara').data(d => d.paths)
                .join('path').attr('class', 'bg_chara')
                .attr('d', d => d.path)
                .attr('fill', d => d.fill)
                .attr('stroke-width', 0)
                .attr('stroke', d => d.color)
            // .attr('filter',"url(#watercolor-v2)")

            chara
                .selectAll('.name').data(d => [d])
                .join('text').attr('class', 'name')
                .text(d => d.character)
                .attr('fill', d => d.fontcolor)
                .attr('font-size', d => d.fontsize)
                .attr('y', d => d.fontsize * 0.35)
                .attr('text-anchor', 'middle')
                .attr('pointer-events','none')

            chara
            .style('cursor', offset && offset.noSound ? 'auto':'pointer')
            .on('click', function(d){
                if(offset && offset.noSound)return;
                const audio = new Audio(`./static/mp3/${d3.select(this.parentNode).datum().name}${d.tonesInEng[0]}.mp3`);
                audio.play()
            })
            cluster.style('cursor', offset && offset.noHover ? 'auto':'pointer')
                .on("mouseover", function(d) {
                    d3.event.stopPropagation();
                    if(offset && offset.noHover)return;
                    hoverCluster(d)

                })
                .on("mouseout", function(d) {
                    d3.event.stopPropagation();
                    if(offset && offset.noHover)return;
                    hoverCluster()

                })

            function hoverCluster(d) {
                if (d) {
                    clusterInfo.transition().duration(200).attr('opacity', e => e.name === d.name ? 1 : 0)
                } else {
                    clusterInfo.transition().duration(200).attr('opacity', 0)
                }
            }

            svg.transition().duration(aniT / 2).delay(aniT / 2)
                .tween("trackProgress", function() {
                    return function(t) {
                        update.fitView(offset)
                    };
                })
                .on("end", () => update.fitView(offset));

        }


        function getNewClusters(filterList, isFamily, isCirLayout) {
            const newClusters = [] //for data save
            const _newclusters = []; //for layout calc

            filterList.forEach(e => {
                const d = _drawData_lookup[e]
                if (!isFamily || d.snu) {
                    newClusters.push(safeStructuredClone(d))
                    _newclusters.push({ name: d.name, x: 0, y: 0, r: d.r })
                }
            })

            //sort clusters based on filter list
            newClusters.sort((a, b) => filterList.indexOf(a.name) - filterList.indexOf(b.name))

            if (isCirLayout) pack(_newclusters);
            //set the new position for cluster
            let [_x, _y] = [newClusters[0].r - d3.sum(newClusters, d => d.r), 0];
            newClusters.forEach((d, i) => {
                if (isCirLayout) {
                    const newposition = _newclusters.find(e => e.name === d.name)
                    d.x = newposition.x;
                    d.y = newposition.y;
                } else {
                    if (i > 0) _x += newClusters[i - 1].r + d.r * 0.55; //horizental
                    d.x = _x
                    d.y = _y;
                }
            })
            return newClusters;
        }

        update.fitView = (offset) => {
            // console.log(offset)

            const top = (offset && offset.top) ? offset.top : 0;
            const isFullScreen = offset && offset.isFullScreen;

            const box = landscape.node().getBBox();
            box.height = box.height + 2; //consider the root line width
            const scale = Math.min(view_w / box.width, view_h / box.height) * 3;

            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2 - top / 2;
            const viewBoxWidth = isFullScreen ? box.width * scale : Math.max(view_w, box.width);
            const viewBoxHeight = isFullScreen ? box.height * scale : Math.max(view_h, box.height + top);
            const viewBoxX = centerX - viewBoxWidth / 2;
            const viewBoxY = centerY - viewBoxHeight / 2;
            const width = isFullScreen ? view_w : Math.max(view_w, box.width);
            const height = isFullScreen ? view_h : Math.max(view_h, box.height)


            svg
                .attr('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr('width', width).attr('height', height)
            // //if overflow, scroll to center
            if (view_w < box.width) node.node().scrollLeft = (box.width - view_w) / 2;
            if (view_h < box.height) node.node().scrollTop = (offset && offset.scrollTop) ? offset.scrollTop : (box.height - view_h) * 0.3;

        }
        update.filter = (offset) => {
            //offset: {scrollTop,aniT,top,isFullScreen}
            // console.log(currentSearch)
            if (!currentSearch.family && !currentSearch.given) {
                aniT = offset && offset.aniT ? offset.aniT : 0;
                update.vis(_drawData);
                return;
            }
            aniT = offset && offset.aniT ? offset.aniT : 800;
            const _clustersBytype = [];
            const clustersGroup = [];
            const _givenclustersGroup = [];
            const linksGroup = []; //link between english cluster

            //get family name
            // if (currentSearch.family) {
            //     const familyClusters = getNewClusters(currentSearch.family, true, true);
            //     const f_bound = d3.packEnclose(familyClusters)

            //     _clustersBytype.push({ type: 'surname', x: f_bound.x, y: f_bound.y, r: f_bound.r, clustersGroup: [{ r: f_bound.r, x: f_bound.x, y: f_bound.y, clusters: familyClusters, type: 'family' }] })
            // }
            //get given names
            if (currentSearch.given) {
                let uniqCombos = {};
                // const uniqClusters = new Set();
                currentSearch.given.forEach(e => {
                    const names = splitPinyin(e)
                    names.forEach(name => {
                        const key = name.join('#')
                        if (!uniqCombos[key]) uniqCombos[key] = name;
                        // uniqClusters.add(...name)
                    })

                })
                // const _uniqClusters = getNewClusters(Array.from(uniqClusters));

                uniqCombos = Object.values(uniqCombos);

                uniqCombos.forEach(n => {
                    const _givenclusters = getNewClusters(n, false, false);
                    const g_bound = d3.packEnclose(_givenclusters)
                    _givenclustersGroup.push({ r: g_bound.r, x: g_bound.x, y: g_bound.y, clusters: _givenclusters, type: 'given' })
                })

                // console.log(uniqCombos)

                d3.packSiblings(_givenclustersGroup)

                const givenclusters_bound = d3.packEnclose(_givenclustersGroup)
                _clustersBytype.push({ type: 'givenname', x: givenclusters_bound.x, y: givenclusters_bound.y, r: givenclusters_bound.r, clustersGroup: _givenclustersGroup })
            }

            // pack(_clustersBytype)
            // console.log(_clustersBytype)
            //organize all groups
            let [_x, _y] = [0, 0]
            _clustersBytype.forEach((d, i) => {
                if (i > 0) _x += _clustersBytype[i - 1].r + d.r; //horizental

                d.x = _x;
                d.y = _y;
                d.clustersGroup.forEach(e => {
                    e.x += d.x;
                    e.y += d.y;
                    
                    const _links = []
                    e.clusters.forEach((n, j) => {
                        n.x += e.x;
                        n.y += e.y;
                        
                        // n.children.forEach(x => {
                        //     const isFamilychara = e.type === "family" && (!x.familychara || !x.eng_surname.includes(n.name));
                        //     x.paths.forEach(p => {
                        //         if (isFamilychara) {
                        //             p.fill = x['SNU']? chroma(p.color).mix('#fff') : '#f1f3f4';
                        //         }
                        //     })
                        //     if(isFamilychara){
                        //         x.fontcolor = x['SNU']? '#fff': '#ccc'
                        //     }

                        // })
                        clustersGroup.push(n)

                        //link these clusters
                        if (d.type === "givenname") {

                            _links.push(...[
                                { x: n.x - n.r * 0.051, y: n.y + n.text_y },
                                { x: n.x, y: n.y + n.text_y },
                                { x: n.x + n.r * 0.055, y: n.y + n.text_y }
                            ])
                        }
                    })
                    if (_links.length > 1) linksGroup.push(_links)
                })
            })
            // console.log(clustersGroup, linksGroup)

            update.vis(clustersGroup, linksGroup, offset);



        }
        update.cover = () => {
            update.vis(_drawData, [], { isFullScreen: true ,noHover:true,noSound:true});

        }
        update.falling = () => {
            const listEng = ["yang", "liu", "hua", "ying"]
            const listChara = ["杨", "柳", "桦", "樱"]
            const coverClusters = getNewClusters(listEng)
            coverClusters.forEach(d => {
                d.children.forEach(e => {
                    e.isCover = listChara.includes(e.character);
                })
            })
            update.vis(coverClusters, [], { aniT: 0, top: view_h * 0.3,noHover:true });

            landscape.selectAll('.chara')
                .transition()
                .duration(d => d.aniT)
                .ease(d3.easeLinear)
                .attr("transform", d => {
                    if (d.isCover) {
                        return `translate(0,0) rotate(0) scale(1)`;
                    } else {
                        return `translate(${d.x},${d.parentY}) rotate(${d.rotate}) scale(0.5)`;
                    }

                })

        }

        update.hideRoots = (types) => {

            landscape.selectAll('.rootpath')
                .attr('opacity', d => types.includes(d.type) ? 0 : 1)

            if (types.length === 1) {
                const key = types[0] === 'surname' ? 'usage_given' : 'usage_surname';
                const name = types[0] === 'surname' ? 'given names' : 'surnames';
                const thres = types[0] === 'surname' ? 1000 : 78000;
                //show hint
                landscape.selectAll('.cluster')
                    .filter(d => d[key] > thres)
                    .selectAll('.hint').data(d => [d])
                    .join('text').attr('class', 'hint')
                    .text(d => `oval size = usage in ${name} (per million)`)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', font_size[1])
                    .attr('transform', d => `translate(0, ${d.text_y + d[`${key}_r`]/5/2+font_size[1]*0.4})`)
            }
        }
        update.tonecase = (eng, filteredTone) => {
            const cluster = _drawData_lookup[eng]
            //seperate tones
            const toneGroups = {}
            cluster.children.forEach(d => {
                const tone = d.tonesInEng[0];
                if (!filteredTone || filteredTone === tone) {
                    if (!toneGroups[tone]) toneGroups[tone] = { name: d.pinyin_name[0], tone: tone, children: [] };
                    toneGroups[tone].children.push(safeStructuredClone(d))
                }
            })
            const clustersGroup = Object.values(toneGroups)

            //pack characters 

            clustersGroup.forEach(d => {
                d.usage_given_r = Math.sqrt(scale_given(d3.sum(d.children, e => e.usage_given)))
                // d.usage_surname_r = Math.sqrt(scale_surname(d3.sum(d.children, e => e.usage_surname)))
                d.usage_given_path = `m${-d.usage_given_r} 0 a ${d.usage_given_r} ${d.usage_given_r/5} 0 0 0 ${d.usage_given_r * 2} 0 a ${d.usage_given_r} ${d.usage_given_r/5} 0 0 0 ${-d.usage_given_r*2} 0`;
                // d.usage_surname_path = `m${-d.usage_surname_r} 0 a ${d.usage_surname_r} ${d.usage_surname_r/5} 0 0 0 ${d.usage_surname_r * 2} 0 a ${d.usage_surname_r} ${d.usage_surname_r/5} 0 0 0 ${-d.usage_surname_r*2} 0`;
                d.usages = [
                    { type: 'given', path: d.usage_given_path, width: 1, fill: 'none', stroke: "#23170c" },
                    // { type: 'surname', path: d.usage_surname_path, width: 3, fill: 'none', stroke: "#23170c" }
                ]
                // if (d.usage_given_r <= d.usage_surname_r) d.usages.reverse();

                d.usage_given_text = d.usage_given >= 1 ? d3.format(",")(d.usage_given.toFixed(0)) : "<1"
                // d.usage_surname_text = d.usage_surname >= 1 ? d3.format(",")(d.usage_surname.toFixed(0)) : "<1"
                //info
                d.text = [
                    // { text: `surname: <tspan class="fw-bold">${d.usage_surname_text}</tspan>` },
                    { text: `given name: <tspan class="fw-bold">${d.usage_given_text}</tspan>` }
                ];


                //create dummy points 
                const _count = d.children.length;
                const pos_count = _count === 1 ? _count : Math.floor(_count * 1.2 + 1);
                const children = [];
                for (var i = 1; i <= pos_count; i++) {
                    children.push({ r: min - 2.5 });
                }
                d3.packSiblings(children);
                children.sort((a, b) => (Math.ceil(a.y) - Math.ceil(b.y)) || (Math.ceil(a.x) - Math.ceil(b.x))) //from top to bottom, from left to right

                d.children.forEach((chara, i) => {
                    const ch = children[i]
                    chara.x = ch.x;
                    chara.y = ch.y;
                })

                const _packTones = d3.packEnclose(children);
                d.x = _packTones.x
                d.y = _packTones.y
                d.r0 = _packTones.r
                // d.r = d.r0 + labelSize.h * 2
                d.r = Math.max(d.r0 + labelSize.h, labelSize.h * 4)

                // deduct children position
                d.children.forEach(chara => {
                    chara.x -= d.x;
                    chara.y -= (d.y - labelSize.h * 0.5);
                })
            })

            //pack clusters again
            // clustersGroup.sort((a, b) => b.name.localeCompare(a.name))
            clustersGroup.sort((a, b) => +a.tone - +b.tone)

            // pack(clustersGroup);

            let [_x, _y] = [clustersGroup[0].r - d3.sum(clustersGroup, d => d.r), 0];

            clustersGroup.forEach((d, i) => {
                //set the new position for cluster
                if (i > 0) _x += clustersGroup[i - 1].r + d.r * 0.8; //horizental
                d.x = _x
                d.y = _y;
                //add stem for each
                d.stemScale = d.r / StemCanvasSize;
                d.stemX = -d.r / 2
                // d.stemX = -d.r / 2 + d.r * 0.03 //adjust for gravity center
                d.stemY = 0;
                d.text_x = 0
                d.text_y = d.r - font_size[1] * 0.35

                d.info_x = d.text_x + Math.max(d.r * 0.15, font_size[1] * 1)
                // d.info_y = d.r - Math.max(d.usage_given_r / 5, d.usage_surname_r / 5, labelSize.h)
                d.info_y = d.r - Math.max(d.usage_given_r / 5, labelSize.h)
                d.info_y -= font_size[1] * 0.75 * 2

                //save position
                d.x0 = d.x;
                d.y0 = d.y;
            })

            //draw
            update.vis(clustersGroup,[],{noHover:true,noSound:true})
        }

        return update;



    }
    // update.draw = function(_) {
    //     if (typeof _ === 'undefined') return _draw;
    //     _draw = _;
    //     return this;
    // }
    return draw;

}