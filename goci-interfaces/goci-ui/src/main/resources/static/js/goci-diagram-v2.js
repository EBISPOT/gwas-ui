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
