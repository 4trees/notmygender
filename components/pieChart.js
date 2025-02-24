function pieChart(_, data) {
    const node = _;
    let _height, _width;
    let _startAngle = 0;
    let _endAngle = Math.PI * 2;
    let currentPie = 0;

    function updateViz() {


        let [view_w, view_h] = [_width || node.node().clientWidth, _height || node.node().clientHeight];

        const radius = Math.max(view_w, view_h) / 2 - 10;

        // Create a pie generator
        const pie = d3.pie()
            .value(d => d.n)
            .startAngle(_startAngle)
            .endAngle(_endAngle);

        // Create an arc generator
        const arc = d3.arc()
            .innerRadius(0) // for a pie chart
            .outerRadius(radius)
            .cornerRadius(radius);

        // Generate the pie slices
        const arcs = pie(data);

        // console.log(arcs)
        const svg = node.selectAll('svg').data([0]).join('svg')
            .attr('width', view_w).attr('height', view_h)

        const viz = svg.selectAll('.viz').data([0]).join('g')
            .attr('class', 'viz')

        const landscape = viz.selectAll('.landscape').data([0]).join('g')
            .attr('class', 'landscape')
            .attr("transform", `translate(${view_w / 2}, ${radius + 10})`);

        const marker = landscape.selectAll('.marker').data(arcs)
            .join('path').attr('class', 'marker')
            .attr('d', d => `M${Math.sin((d.startAngle+d.endAngle)/2)* radius} ${-Math.cos((d.startAngle+d.endAngle)/2)* radius} L${Math.sin((d.startAngle+d.endAngle)/2 -Math.PI*0.01)* (radius+12)} ${-Math.cos((d.startAngle+d.endAngle)/2 -Math.PI*0.01)* (radius+12)} L${Math.sin((d.startAngle+d.endAngle)/2 +Math.PI*0.01)* (radius+12)} ${-Math.cos((d.startAngle+d.endAngle)/2 +Math.PI*0.01)* (radius+12)}z`)
            .attr("fill", (d, i) => i > 4 ? '#000' : d.data.color)
            .attr('opacity', (d,i) => i === currentPie ? 1 : 0)

        const shape = landscape.selectAll('.shape').data(arcs)
            .join('path').attr('class', 'shape')
            .attr("d", arc)
            .attr("fill", (d, i) => i > 4 ? '#ebeced' : d.data.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", "1px")
            .style('cursor', 'pointer')
            .on('click', function(d,j) {
                const currentSelectedSurname = d.data;
                currentSearch.family = [currentSelectedSurname.eng];
                currentSearch.given = null;
                graphcase_f.filter({noHover:true})
                graphcase_f.hideRoots(['given'])
                let second = "", isSlightly = false;
                const eng_usage = d3.format(",")(english_lookup[currentSelectedSurname.eng].usage_surname.toFixed(0));
                const surname_usage = d3.format(",")(character_lookup[currentSelectedSurname.surname].usage_surname.toFixed(0));
                if (eng_usage === surname_usage) {
                    isSlightly = true;
                    second = `this total remains close at ${eng_usage} per million.`
                } else {
                    isSlightly = Math.abs(english_lookup[currentSelectedSurname.eng].usage_surname - character_lookup[currentSelectedSurname.surname].usage_surname) < 200
                    second = `the total rises${isSlightly ? ' slightly':""} to <span class="fw-bold">${eng_usage}</span> per million people.`
                }
                pieHintContainer.html(`Taking "<span class="text-capitalize">${currentSelectedSurname.eng}</span>" as an example, <span class="fw-bold">${d3.format(".0%")(currentSelectedSurname.per)}</span> of the population (<span class="fw-bold">${surname_usage}</span> per million) use "<span class="fw-bold">${currentSelectedSurname.surname}</span>" as their surname. Including other${isSlightly ? ' rare':""} surnames that share the same syllable, ${second}`)

                currentPie = j;
                marker.attr('opacity', (d,i) => i === currentPie ? 1 : 0)

            })
        landscape.selectAll(".label").data(arcs)
            .join("text").attr('class', 'lable')
            .attr('text-anchor', 'middle')
            .attr("transform", d => `translate(${Math.sin((d.startAngle + d.endAngle)/2) * (radius-20)},${-Math.cos((d.startAngle + d.endAngle)/2) * (radius-20)})`)
            .attr("dy", ".35em")
            .attr("font-size", (d, i) => i > 4 ? '0.8em' : '1em')
            .attr("fill", (d, i) => i > 4 ? '#222' : '#fff')
            // .attr('fill','#222')
            .style('pointer-events', 'none')
            .text(d => d.data.surname);

    }
    updateViz.startAngle = function(_) {
        if (typeof _ === 'undefined') return _startAngle;
        _startAngle = _;
        return this;
    }
    updateViz.endAngle = function(_) {
        if (typeof _ === 'undefined') return _endAngle;
        _endAngle = _;
        return this;
    }
    return updateViz

}