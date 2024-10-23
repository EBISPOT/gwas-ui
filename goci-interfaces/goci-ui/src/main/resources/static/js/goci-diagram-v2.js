let server = "http://localhost:8685";

function getGraphData(chromosomeNum) {
    let searchTerm = filterData.innerHTML;
    let check = [null, undefined, ''].includes(searchTerm);
    let url = `${server}/chromosomes/${chromosomeNum}`;
    if (!check) {
        url += `?parent=${searchTerm}`;
    }

    return fetch(url)
        .then((response) => {
            return response.json().then((data) => {
                //console.log(data);
                return data;
            }).catch((err) => {
                console.log(err);
            })
        });
}



let traitRadius = 4;
let displayGap = (traitRadius * 2); // Explain Rule
let maxOnARow = 30; // You can also determine Rule of margin through maxOnARow & traitRadius & traitCount

function renderIcons(traitData, colorData, regionData, cx, regionLineYStart, regionLineYEnd, transformXPos, transformYPos) {

    const colorHolder = {
        "Digestive system disease": "AE6543",
        "Cardiovascular disease": "AA2C2C",
        "Metabolic disease": "FDAB57",
        "Immune system disease": "FFEA64",
        "Nervous system disease": "FF2D8E",
        "Liver enzyme measurement": "5B8E00",
        "Lipid or lipoprotein measurement": "AAD95D",
        "Inflammatory marker measurement": "C5E7BD",
        "Hematological measurement": "82CDC0",
        "Body weights and measures": "5BC5FF",
        "cardiovascular measurement": "75A8CD",
        "cancer": "B475B5",
        "Biological process": "B6B1D5",
        "Response to drug": "FCC6E1",
        "NO_PARENT": "005B8E",
    };

    let regionLine = "";
    let circleConstruct = "";

    let cy = regionLineYStart + regionLineYEnd;

    for (let counter = 0; counter < traitData.length; counter++) {
        //let randomColor = colors[(Math.floor(Math.random() * colors.length))];
        if (counter == 0) {
            regionLine = `
                    <g id='17942' transform='translate(${transformXPos}, ${transformYPos})' class='gwas-trait'>
                        <path d='m 38.7,${regionLineYStart} 11,0.0 23,${regionLineYEnd}' style='fill:none;stroke:#211c1d;stroke-width:1.1' />
                    </g>
                    `;
        }

        let traitName = traitData[counter]
        let parentCategory = colorData[`${traitName}`];
        let dColor = colorHolder[`${parentCategory}`];

        circleConstruct += `
              <circle
                  transform='translate(${transformXPos}, ${transformYPos})'
                  cx=${cx}
                  cy=${cy}
                  r= ${traitRadius}
                  fill= #${dColor}
                  stroke='black'
                  stroke-width='0.5'
                  gwasname='systemic scleroderma'
                  title='Hello from speech bubble!'
                  class='my-tooltip'
                  fading='TRUE'
                  gwasassociation='34019'
                  priority='0'
                  data-toggle='modal'
                  data-target='#myModal'
                  onClick="sendNow('${regionData}', '${traitName}')"
                />
            `;

        cx += displayGap;
        if (counter % maxOnARow == 0 && counter != 0) {
            cy += displayGap;
            cx = 75;
        }
    }
    return regionLine + circleConstruct;
}


