const sidebar = d3.select('#popup');
const sidebarContent = d3.select('#popContent');

sidebar.select('#popClose').on('click', function() {
    updatePopup()
})
sidebar.select('#popCollapse').on('click', function() {
    const current = sidebar.classed('collapsed')
    sidebar.classed('collapsed', !current)
})
const updatePopup = (data) => {

    if (data) {
        sidebar.classed('open', true)
        sidebar.classed('collapsed', false)

        const regex = /([A-Za-z\s]+?\s?\([^\)]+\))/;
        const modifiedText = data.intro.replace(regex, (match) => {
            return `<a href="${data.wiki_link}" target="_blank">${match}</a>`;
        });

        html = `
        <div class="d-flex flex-column px-4 pe-5 py-2 col-12 fs-7">
            <p class="py-2">${modifiedText}</p>
        </div>
        `
        sidebarContent.html(html);


    } else {
        sidebar.classed('open', false)
        sidebar.classed('collapsed', false)



    }

}