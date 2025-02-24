const tooltip = d3.select('#tooltip');
const tooltipContent = tooltip.select('#tooltipContent');
tooltip.style('pointer-events', isMobile ? 'auto' : 'none')
const updateTooltip = (data, dom, type) => {
    if (data) {
        let html;

        switch (type) {
            case 'surname':

                html = `
                    <div class="col-12 d-flex flex-column fs-7 p-2">
                        <div class="d-flex flex-column col-12">
                            <div><span class="fw-bold fs-6">${data.character}</span><span class="fs-7 ms-2">${data.pinyin_name.map(d => d).join('')}</span></div>
                        </div>
                        <div>surname uniqueness: ${interpretCharacterUsage(data['SNU'])}</div>
                        <div class="text-muted border-top pt-2 mt-2 fs-7">click to see its profile<div>
                    </div>
                `
                

                break;
            case 'givenname':
                html = `
                    <div class="col-12 d-flex flex-column fs-7 p-2">
                        <div class="d-flex flex-column col-12">
                            <div><span class="fw-bold fs-6">${data.character}</span><span class="fs-7 ms-2">${data.pinyin_name.map(d => d).join('')}</span></div>
                        </div>
                        <div>name-character uniqueness: ${interpretCharacterUsage(data['NU'])}</div>
                        <div class="text-muted border-top pt-2 mt-2 fs-7">click to see its profile<div>
                    </div>
                `
                break;
            default:

                html = `
                    <div class="col-12 d-flex flex-column fs-7 p-2">
                        <div class="d-flex flex-column col-12">
                            <div><span class="fw-bold fs-6">${data.character}</span><span class="fs-7 ms-2">${data.pinyin_name.map(d => d).join('')}</span></div>
                        </div>
                        ${data['SNU'] ? ` 
                            <div>surname uniqueness: ${interpretCharacterUsage(data['SNU'])}</div>
                        `:""}
                        <div>name-character uniqueness: ${interpretCharacterUsage(data['NU'])}</div>
                        <div class="text-muted border-top pt-2 mt-2 fs-7">click to see its profile<div>
                    </div>
                `



        }


        tooltipContent.html(html)

        tooltip.classed('d-none', false);

        const nodeDomSize = dom.getBoundingClientRect();
        let [x, y] = [nodeDomSize.x, nodeDomSize.y]
        const tooltipSize = tooltip.node().getBoundingClientRect();

        if (x > w - tooltipSize.width - nodeDomSize.width) {
            x = x - tooltipSize.width - 10
        } else {

            x = x + nodeDomSize.width + 10;
        }
        if (x > w) x = x - w

        if (y + tooltipSize.height > (h - 60)) {
            y = h - 60 - tooltipSize.height
        }

        tooltip.style('top', `${y}px`)
            .style('left', `${x}px`)


        // tooltipContent
        //     .on('click', function() {
        //         d3.event.stopPropagation();
        //         updateTooltip()
        //         if (currentSelection) {
        //             updateProfile(node, currentSelection)
        //         } else {
        //             updateProfile(profiledata)
        //         }

        //     })

    } else {
        tooltip.classed('d-none', true)
    }

}