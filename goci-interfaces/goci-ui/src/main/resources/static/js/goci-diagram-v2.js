let server = "http://gwas-snoopy.ebi.ac.uk:8685";

function sendNow(region, trait) {
    fetch(`${server}/associations?region=${region}&efo=${trait}`)
        .then((response) => {
            response.json().then((data) => {
                console.log(data);
                associationHeader.innerHTML = `SNPs associated with trait '${trait}' in region ${region}'`;
                let rowData = "";
                data.forEach(function (association) {
                    rowData += `<tr>
                                    <td>${association.snp}</td>
                                    <td>${association.pvalueMantissa} x ${association.pvalueMantissa} <sup>${association.pvalueExponent}</sup></td>
                                    <td>${association.efoMapping}</td>
                                    <td>${association.gwasTraits}</td>
                                    <td>${association.study}</td>
                                </tr>`;
                })
                associationData.innerHTML = rowData;
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
        "Response to drug": "FCCDE5",
        "Biological process": "BEBADA",
        "NO_PARENT": "005B8E",
    };

    let regionLine = "";
    let circleConstruct = "";

    let cy = regionLineYStart + regionLineYEnd;
    let rowItemCounter = 0;

    for (let counter = 0; counter < traitData.length; counter++) {
        rowItemCounter++
        //let randomColor = colors[(Math.floor(Math.random() * colors.length))];
        if (counter === 0) {
            regionLine = `
                      <g id='17942' transform='translate(${transformXPos}, ${transformYPos})' class='gwas-trait'>
                          <path d='m 50,${regionLineYStart} 11,0.0 23,${regionLineYEnd}' style='fill:none;stroke:#AEB1B4;stroke-width:1.1' />
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
                    onClick="sendNow('${regionData}', '${traitName}')">
                    <title> ${traitName} </title>
                </circle>
              `;


        cx += displayGap;
        // if (counter % maxOnARow == 0 && counter != 0) {
        //     cy += displayGap;
        //     cx = 85;
        // }

        if (rowItemCounter === maxOnARow) {
            cy += displayGap;
            cx = 85;
            rowItemCounter = 0;
        }
    }

    return regionLine + circleConstruct;
}


function buildRegionData(data, transformXPos, chromosomeNum) {
    let regions = "";
    let regionLineYStart = 10;
    let regionLineYEnd = -450;
    let regionLineYStartInc = 0;
    let regionLineYEndInc = 0;
    let regionCount = 0;
    let traitCount = 0;
    let cx = 85;

    let avRegionLineYEnd = 0;

    let traitCountList = []
    let traitData = []
    let categoryData = []
    let regionData = [];

    let categoryMap = {};
    let traitMap = {};
    let traitCountMap = {};

    data.forEach(function (obj) {
        regionCount = data.length;
        traitCount = obj.traits.length;

        traitCountList.push(traitCount)
        traitData.push(obj.traits)
        regionData.push(obj.region)
        categoryData.push(obj.categories)

        categoryMap[obj.region] = obj.categories;
        traitMap[obj.region] = obj.traits;
        traitCountMap[obj.region] = obj.traits.length;

        avRegionLineYEnd += (traitCount / maxOnARow) * 8
    })

    avRegionLineYEnd = avRegionLineYEnd / regionCount;

    regionLineYStart = 5;
    regionLineYStartInc = 5 // regionCount;
    regionLineYEnd = (regionCount * avRegionLineYEnd) / -2 //-450; //(regionCount * regionLineYEndInc) / -2
    regionLineYEndInc = 30; //(traitCount / 25) * 8;


    const chromosomeCytogeneticBandMap = {
        "1": cytogeneticBandsChr_1,
        "2": cytogeneticBandsChr_2,
        "3": cytogeneticBandsChr_3,
        "4": cytogeneticBandsChr_4,
        "5": cytogeneticBandsChr_5,
        "6": cytogeneticBandsChr_6,
        "7": cytogeneticBandsChr_7,
        "8": cytogeneticBandsChr_8,
        "9": cytogeneticBandsChr_9,
        "10": cytogeneticBandsChr_10,
        "11": cytogeneticBandsChr_11,
        "12": cytogeneticBandsChr_12,
        "13": cytogeneticBandsChr_13,
        "14": cytogeneticBandsChr_14,
        "15": cytogeneticBandsChr_15,
        "16": cytogeneticBandsChr_16,
        "17": cytogeneticBandsChr_17,
        "18": cytogeneticBandsChr_18,
        "19": cytogeneticBandsChr_19,
        "20": cytogeneticBandsChr_20,
        "21": cytogeneticBandsChr_21,
        // "22": cytogeneticBandsChr_22,
        "X": cytogeneticBandsChr_X,
        "Y": cytogeneticBandsChr_Y,
    }

    let cytoBands = chromosomeCytogeneticBandMap[chromosomeNum]

    Object.keys(cytoBands).forEach((region, i) => {
        if (traitMap[region]) {
            regions += renderIcons(traitMap[region], categoryMap[region], region, cx, cytoBands[region], regionLineYEnd, transformXPos, 0);
            regionLineYStart += 5;
            regionLineYEnd += ((traitCountMap[region] / maxOnARow) * 8) + 5;
            //if (i === 50) break;
        }
    })

    return regions;
}


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


let chromosomeNum = "1";
let transformXPos = 0;
let chromosome = "";
let data = "";
let regions = "";

getGraphData(chromosomeNum="1").then((data) => {
    chromosome = chromosomeGen1(transformXPos=0, chromosomeNum="1");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="1");
    chromosome_1_plot.innerHTML = ` ${chromosome}  ${regions}`;
});


getGraphData(chromosomeNum="2").then((data) => {
    chromosome = chromosomeGen2(transformXPos=0, chromosomeNum="2");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="2");
    chromosome_2_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="3").then((data) => {
    chromosome = chromosomeGen3(transformXPos=0, chromosomeNum="3");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="3");
    chromosome_3_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="4").then((data) => {
    chromosome = chromosomeGen4(transformXPos=0, chromosomeNum="4");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="4");
    chromosome_4_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="5").then((data) => {
    chromosome = chromosomeGen5(transformXPos=0, chromosomeNum="5");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="5");
    chromosome_5_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="6").then((data) => {
    chromosome = chromosomeGen6(transformXPos=0, chromosomeNum="6");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="6");
    chromosome_6_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="7").then((data) => {
    chromosome = chromosomeGen7(transformXPos=0, chromosomeNum="7");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="7");
    chromosome_7_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="8").then((data) => {
    chromosome = chromosomeGen8(transformXPos=0, chromosomeNum="8");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="8");
    chromosome_8_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="9").then((data) => {
    chromosome = chromosomeGen9(transformXPos=0, chromosomeNum="9");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="9");
    chromosome_9_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="10").then((data) => {
    chromosome = chromosomeGen10(transformXPos=0, chromosomeNum="10");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="10");
    chromosome_10_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="11").then((data) => {
    chromosome = chromosomeGen11(transformXPos=0, chromosomeNum="11");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="11");
    chromosome_11_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="12").then((data) => {
    chromosome = chromosomeGen12(transformXPos=5, chromosomeNum="12");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="12");
    chromosome_12_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="13").then((data) => {
    chromosome = chromosomeGen13(transformXPos=0, chromosomeNum="13");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="13");
    chromosome_13_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="14").then((data) => {
    chromosome = chromosomeGen14(transformXPos=0, chromosomeNum="14");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="14");
    chromosome_14_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="15").then((data) => {
    chromosome = chromosomeGen15(transformXPos=5, chromosomeNum="15");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="15");
    chromosome_15_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="16").then((data) => {
    chromosome = chromosomeGen16(transformXPos=0, chromosomeNum="16");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="16");
    chromosome_16_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="17").then((data) => {
    chromosome = chromosomeGen17(transformXPos=0, chromosomeNum="17");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="17");
    chromosome_17_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="18").then((data) => {
    chromosome = chromosomeGen18(transformXPos=0, chromosomeNum="18");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="18");
    chromosome_18_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="19").then((data) => {
    chromosome = chromosomeGen19(transformXPos=5, chromosomeNum="19");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="19");
    chromosome_19_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="20").then((data) => {
    chromosome = chromosomeGen20(transformXPos=0, chromosomeNum="20");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="20");
    chromosome_20_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="21").then((data) => {
    chromosome = chromosomeGen21(transformXPos=0, chromosomeNum="21");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="21");
    chromosome_21_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="X").then((data) => {
    chromosome = chromosomeGenX(transformXPos=0, chromosomeNum="X");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="X");
    chromosome_X_plot.innerHTML = ` ${chromosome}  ${regions}`;
});

getGraphData(chromosomeNum="Y").then((data) => {
    chromosome = chromosomeGenY(transformXPos=5, chromosomeNum="Y");
    regions = buildRegionData(data, transformXPos=0, chromosomeNum="Y");
    chromosome_Y_plot.innerHTML = ` ${chromosome}  ${regions}`;
});


