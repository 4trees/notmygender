const getSearch = (search_list, container, func, hint) => {
    // console.log(search_list)
    container
        .html(`
                <div class="search-input fs-7">
                    <div class="search-bar">
                        <div class="input">
                            <i class="icon-search p-2 d-none"></i>
                            <input class="name-input" type="search" placeholder="${hint}">
                        </div>
                    </div>
                </div>
                <div class="search-suggestion d-none">
                    <div class="suggestion-list d-flex flex-wrap"></div>
                </div>
            `)

    const nameInput = container.select('.name-input').node()

    nameInput.addEventListener('search', (event) => {

        if (!nameInput.value) {
            search_onchange(null)
            return;
        }
        displayMatches(nameInput.value)
    });
    nameInput.addEventListener('keyup', (event) => {
        if (!nameInput.value) {
            search_onchange(null)
            return;
        }
        if (event.keyCode === 13) { //absolute match
            displayMatches(nameInput.value, true)
        } else { //match from starting letters
            displayMatches(nameInput.value, false)
        }


    });

    const createSuggestions = (list) => {
        // console.log(list)
        if (list.length > 0) {
            list.sort((a, b) => a.length - b.length)
            container.select('.suggestion-list')
                .selectAll('.suggestion').data(list.slice(0, 4))
                .join('li').attr('class', 'suggestion fs-7')
                .html(d => `
                <div class="item fw-normal">${d}</div>
            `)
                .on('mousedown', (d) => {
                    d3.event.stopPropagation();

                    search_onchange(d); //absolute match

                })
            //update chart
            func(list)
        } else {
            if (splitPinyin(nameInput.value).length > 0) {
                func([nameInput.value])
                container.select('.search-suggestion').classed('d-none',true)
            } else {

                container.select('.suggestion-list')
                    .selectAll('.suggestion').data([0])
                    .join('li').attr('class', 'suggestion fs-7')
                    .html(`<div class="text-muted fst-italic">This name is not completed or does not exist.</div>`)

            }

        }
    }

    const displayMatches = (value, abs) => {
        // console.log('displayMatches')

        container.select('.search-suggestion').classed('d-none', value == '');

        const matchArray = findMatches(value, abs);


        createSuggestions(matchArray);


    }
    const findMatches = (wordToMatch, abs) => {

        // const regex = new RegExp(wordToMatch, 'gi');
        // const matchs = search_list.filter(d => (d.name && d.name.match(regex)) || (d.iso && d.iso.match(regex)))
        const regex = new RegExp(wordToMatch);
        const matchs = search_list.filter(d => d && (abs ? d === wordToMatch : d.match(new RegExp(`^${regex.source}`))));


        return matchs
    };

    (function() {
        function triggerSearch(event) {
            const d = event.detail;
            this.currentSearchVal = d ? d : false;
            container.select('.name-input').node().value = this.currentSearchVal || "";

            //update chart
            func([d])

            container.select('.search-suggestion').classed('d-none', true);
        }

        nameInput.addEventListener('triggerSearchEvent', triggerSearch);
    })();


    const search_onchange = (d) => {

        this.currentSearchVal = d ? d : null;
        container.select('.name-input').node().value = this.currentSearchVal || "";

        //update chart
        if (d) {
            func([d])
        } else {
            func(null)
        }


        container.select('.search-suggestion').classed('d-none', true);

    }

}