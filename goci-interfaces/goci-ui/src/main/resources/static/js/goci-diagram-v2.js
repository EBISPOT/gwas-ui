let server = "http://localhost:8685";

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

function chromosomeGen(transformXPos, chromosomeNum) {
    let chromosome = `
    <g gwasname='Chromosome ${chromosomeNum}' id='chromosome${chromosomeNum}' transform='translate(${transformXPos}, 0)'>
      <path d='m 39,112.90624999999997 11.382812500000002,0.0 0.0,-14.896000000000003 -11.382812500000002,-0.0 0.0,14.896000000000003 z ' id='1p31.1' style='fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,144.62999999999997 11.382812500000002,0.0 0.0,-4.926275 -11.382812500000002,-0.0 0.0,4.926275 z ' id='1p21.1' style='fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,307.25124999999997 11.382812500000002,0.0 0.0,-7.113775000000001 -11.382812500000002,-0.0 0.0,7.113775000000001 z ' id='1q41' style='fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,280.73862499999996 11.382812500000002,0.0 0.0,-5.2983375 -11.382812500000002,-0.0 0.0,5.2983375 z ' id='1q31.3' style='fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,272.578875 11.382812500000002,0.0 0.0,-5.29785 -11.382812500000002,-0.0 0.0,5.29785 z ' id='1q31.1' style='fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,7.691249999999968 11.382812500000002,0.0 0.0,-3.4951125 -11.382812500000002,-0.0 0.0,3.4951125 z ' id='1p36.32' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,7.691249999999968 11.382812500000002,0.0 0.0,-3.4951125 -11.382812500000002,-0.0 0.0,3.4951125 z ' id='1p36.32-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,12.449999999999989 11.382812500000002,0.0 0.0,-2.5878875 -11.382812500000002,-0.0 0.0,2.5878875 z ' id='1p36.23' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,12.449999999999989 11.382812500000002,0.0 0.0,-2.5878875 -11.382812500000002,-0.0 0.0,2.5878875 z ' id='1p36.23-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,32.39124999999996 11.382812500000002,0.0 0.0,-3.0415 -11.382812500000002,-0.0 0.0,3.0415 z ' id='1p36.12' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,32.39124999999996 11.382812500000002,0.0 0.0,-3.0415 -11.382812500000002,-0.0 0.0,3.0415 z ' id='1p36.12-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,39.642499999999984 11.382812500000002,0.0 0.0,-3.0415 -11.382812500000002,-0.0 0.0,3.0415 z ' id='1p35.3' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,39.642499999999984 11.382812500000002,0.0 0.0,-3.0415 -11.382812500000002,-0.0 0.0,3.0415 z ' id='1p35.3-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,45.53249999999997 11.382812500000002,0.0 0.0,-3.0400375000000004 -11.382812500000002,-0.0 0.0,3.0400375000000004 z ' id='1p35.1' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,45.53249999999997 11.382812500000002,0.0 0.0,-3.0400375000000004 -11.382812500000002,-0.0 0.0,3.0400375000000004 z ' id='1p35.1-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,56.86250000000001 11.382812500000002,0.0 0.0,-4.3994125 -11.382812500000002,-0.0 0.0,4.3994125 z ' id='1p34.2' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,56.86250000000001 11.382812500000002,0.0 0.0,-4.3994125 -11.382812500000002,-0.0 0.0,4.3994125 z ' id='1p34.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,313.50762499999996 11.382812500000002,0.0 0.0,-4.53125 -11.382812500000002,-0.0 0.0,4.53125 z ' id='1q42.12' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,313.50762499999996 11.382812500000002,0.0 0.0,-4.53125 -11.382812500000002,-0.0 0.0,4.53125 z ' id='1q42.12-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,295.381125 11.382812500000002,0.0 0.0,-4.5336875 -11.382812500000002,-0.0 0.0,4.5336875 z ' id='1q32.2' style='fill:#f1f2f1;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,295.381125 11.382812500000002,0.0 0.0,-4.5336875 -11.382812500000002,-0.0 0.0,4.5336875 z ' id='1q32.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,340.08525 11.382812500000002,0.0 0.0,-8.44775 -11.382812500000002,-0.0 0.0,8.44775 z ' id='1q43' style='fill:#afb1b4;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,340.08525 11.382812500000002,0.0 0.0,-8.44775 -11.382812500000002,-0.0 0.0,8.44775 z ' id='1q43-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,126.17249999999999 11.382812500000002,0.0 0.0,-5.2763625 -11.382812500000002,-0.0 0.0,5.2763625 z ' id='1p22.2' style='fill:#afb1b4;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,126.17249999999999 11.382812500000002,0.0 0.0,-5.2763625 -11.382812500000002,-0.0 0.0,5.2763625 z ' id='1p22.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,138.185 11.382812500000002,0.0 0.0,-5.27735 -11.382812500000002,-0.0 0.0,5.27735 z ' id='1p21.3' style='fill:#afb1b4;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,138.185 11.382812500000002,0.0 0.0,-5.27735 -11.382812500000002,-0.0 0.0,5.27735 z ' id='1p21.3-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,70.43 11.382812500000002,0.0 0.0,-5.275875 -11.382812500000002,-0.0 0.0,5.275875 z ' id='1p33' style='fill:#afb1b4;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,70.43 11.382812500000002,0.0 0.0,-5.275875 -11.382812500000002,-0.0 0.0,5.275875 z ' id='1p33-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,251.280125 11.382812500000002,0.0 0.0,-5.3002875 -11.382812500000002,-0.0 0.0,5.3002875 z ' id='1q24.3' style='fill:#afb1b4;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,251.280125 11.382812500000002,0.0 0.0,-5.3002875 -11.382812500000002,-0.0 0.0,5.3002875 z ' id='1q24.3-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,21.51249999999999 11.382812500000002,0.0 0.0,-4.3999 -11.382812500000002,-0.0 0.0,4.3999 z ' id='1p36.21' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,21.51249999999999 11.382812500000002,0.0 0.0,-4.3999 -11.382812500000002,-0.0 0.0,4.3999 z ' id='1p36.21-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,154.075 11.382812500000002,0.0 0.0,-4.625 -11.382812500000002,-0.0 0.0,4.625 z ' id='1p13.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,154.075 11.382812500000002,0.0 0.0,-4.625 -11.382812500000002,-0.0 0.0,4.625 z ' id='1p13.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,326.1975 11.382812500000002,0.0 0.0,-4.0776375 -11.382812500000002,-0.0 0.0,4.0776375 z ' id='1q42.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,326.1975 11.382812500000002,0.0 0.0,-4.0776375 -11.382812500000002,-0.0 0.0,4.0776375 z ' id='1q42.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,163.13999999999996 11.382812500000002,0.0 0.0,-4.174800000000001 -11.382812500000002,-0.0 0.0,4.174800000000001 z ' id='1p12' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,163.13999999999996 11.382812500000002,0.0 0.0,-4.174800000000001 -11.382812500000002,-0.0 0.0,4.174800000000001 z ' id='1p12-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,79.72125 11.382812500000002,0.0 0.0,-3.46485 -11.382812500000002,-0.0 0.0,3.46485 z ' id='1p32.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,79.72125 11.382812500000002,0.0 0.0,-3.46485 -11.382812500000002,-0.0 0.0,3.46485 z ' id='1p32.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,92.86374999999992 11.382812500000002,0.0 0.0,-5.9565375 -11.382812500000002,-0.0 0.0,5.9565375 z ' id='1p31.3' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,92.86374999999992 11.382812500000002,0.0 0.0,-5.9565375 -11.382812500000002,-0.0 0.0,5.9565375 z ' id='1p31.3-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,257.85137499999996 11.382812500000002,0.0 0.0,-4.1665 -11.382812500000002,-0.0 0.0,4.1665 z ' id='1q25.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,257.85137499999996 11.382812500000002,0.0 0.0,-4.1665 -11.382812500000002,-0.0 0.0,4.1665 z ' id='1q25.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,242.215125 11.382812500000002,0.0 0.0,-3.486325 -11.382812500000002,-0.0 0.0,3.486325 z ' id='1q24.1' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,242.215125 11.382812500000002,0.0 0.0,-3.486325 -11.382812500000002,-0.0 0.0,3.486325 z ' id='1q24.1-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,231.79125 11.382812500000002,0.0 0.0,-4.8461875 -11.382812500000002,-0.0 0.0,4.8461875 z ' id='1q23.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,231.79125 11.382812500000002,0.0 0.0,-4.8461875 -11.382812500000002,-0.0 0.0,4.8461875 z ' id='1q23.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,218.195 11.382812500000002,0.0 0.0,-4.84375 -11.382812500000002,-0.0 0.0,4.84375 z ' id='1q22' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,218.195 11.382812500000002,0.0 0.0,-4.84375 -11.382812500000002,-0.0 0.0,4.84375 z ' id='1q22-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,206.86624999999998 11.382812500000002,0.0 0.0,-4.8461875 -11.382812500000002,-0.0 0.0,4.8461875 z ' id='1q21.2' style='fill:#d6d6d7;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,206.86624999999998 11.382812500000002,0.0 0.0,-4.8461875 -11.382812500000002,-0.0 0.0,4.8461875 z ' id='1q21.2-o' style='fill:none;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,195.98749999999998 11.382812500000002,0.0 0.0,-20.7075 -11.382812500000002,-0.0 0.0,20.7075 z ' id='1q12' style='fill:#c4cdf2;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 39,195.98749999999998 11.382812500000002,0.0 0.0,-20.7075 -11.382812500000002,-0.0 0.0,20.7075 z ' id='1q12-o' style='fill:none;stroke:#797677;stroke-width:0.8;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,202.02006249999997 11.382812500000002,0.0 0,-6.032562499999983 -11.382812500000002,-0.0 0,6.032562499999983 z ' id='1q21.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,238.7288 11.382812500000002,0.0 0,-6.937550000000016 -11.382812500000002,-0.0 0,6.937550000000016 z ' id='1q23.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,245.9798375 11.382812500000002,0.0 0,-3.7647125000000017 -11.382812500000002,-0.0 0,3.7647125000000017 z ' id='1q24.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,132.90765 11.382812500000002,0.0 0,-6.735150000000004 -11.382812500000002,-0.0 0,6.735150000000004 z ' id='1p22.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,308.97637499999996 11.382812500000002,0.0 0,-1.7251249999999914 -11.382812500000002,-0.0 0,1.7251249999999914 z ' id='1q42.11' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,275.44028749999995 11.382812500000002,0.0 0,-2.8614124999999717 -11.382812500000002,-0.0 0,2.8614124999999717 z ' id='1q31.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,165.08374999999998 11.382812500000002,0.0 0,-1.9437500000000227 -11.382812500000002,-0.0 0,1.9437500000000227 z ' id='1p11.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,9.862112499999988 11.382812500000002,0.0 0,-2.1708625000000197 -11.382812500000002,-0.0 0,2.1708625000000197 z ' id='1p36.31' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,267.281025 11.382812500000002,0.0 0,-9.429650000000038 -11.382812500000002,-0.0 0,9.429650000000038 z ' id='1q25.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,65.15412500000001 11.382812500000002,0.0 0,-8.291624999999996 -11.382812500000002,-0.0 0,8.291624999999996 z ' id='1p34.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,213.35125 11.382812500000002,0.0 0,-6.485000000000014 -11.382812500000002,-0.0 0,6.485000000000014 z ' id='1q21.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,158.96519999999995 11.382812500000002,0.0 0,-4.890199999999965 -11.382812500000002,-0.0 0,4.890199999999965 z ' id='1p13.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,29.349749999999958 11.382812500000002,0.0 0,-7.837249999999969 -11.382812500000002,-0.0 0,7.837249999999969 z ' id='1p36.13' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,17.11259999999999 11.382812500000002,0.0 0,-4.662600000000001 -11.382812500000002,-0.0 0,4.662600000000001 z ' id='1p36.22' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,36.600999999999985 11.382812500000002,0.0 0,-4.209750000000028 -11.382812500000002,-0.0 0,4.209750000000028 z ' id='1p36.11' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,322.1198625 11.382812500000002,0.0 0,-8.612237500000049 -11.382812500000002,-0.0 0,8.612237500000049 z ' id='1q42.13' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,52.463087500000015 11.382812500000002,0.0 0,-6.930587500000044 -11.382812500000002,-0.0 0,6.930587500000044 z ' id='1p34.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,226.94506249999998 11.382812500000002,0.0 0,-8.750062499999984 -11.382812500000002,-0.0 0,8.750062499999984 z ' id='1q23.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,290.8474375 11.382812500000002,0.0 0,-10.108812500000056 -11.382812500000002,-0.0 0,10.108812500000056 z ' id='1q32.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,4.1961375 11.382812500000002,0.0 c 0.0,-1.41625 -2.5415000000000005,-2.5625000000000004 -5.68025,-2.5625000000000004 -3.1371250000000006,-0.0 -5.681125,1.14625 -5.681125,2.5625000000000004 z' id='1p36.33' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,98.01024999999997 11.382812500000002,0.0 0,-5.146500000000046 -11.382812500000002,-0.0 0,5.146500000000046 z ' id='1p31.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,300.137475 11.382812500000002,0.0 0,-4.756349999999998 -11.382812500000002,-0.0 0,4.756349999999998 z ' id='1q32.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,149.45 11.382812500000002,0.0 0,-4.820000000000022 -11.382812500000002,-0.0 0,4.820000000000022 z ' id='1p13.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,120.89613749999998 11.382812500000002,0.0 0,-7.989887500000009 -11.382812500000002,-0.0 0,7.989887500000009 z ' id='1p22.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,331.6375 11.382812500000002,0.0 0,-5.439999999999998 -11.382812500000002,-0.0 0,5.439999999999998 z ' id='1q42.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,139.70372499999996 11.382812500000002,0.0 0,-1.5187249999999608 -11.382812500000002,-0.0 0,1.5187249999999608 z ' id='1p21.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,86.90721249999993 11.382812500000002,0.0 0,-7.185962499999931 -11.382812500000002,-0.0 0,7.185962499999931 z ' id='1p32.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,340.08525 0.0,6 c 0.0,1.416 2.544,2.5633750000000006 5.681125,2.5633750000000006 3.13875,0.0 5.68025,-1.147375 5.68025,-2.5633750000000006 l 0.0,-6 -11.382812500000002,-0.0 z' id='1q44' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,76.2564 11.382812500000002,0.0 0,-5.8263999999999925 -11.382812500000002,-0.0 0,5.8263999999999925 z ' id='1p32.3' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,253.68487499999995 11.382812500000002,0.0 0,-2.40474999999995 -11.382812500000002,-0.0 0,2.40474999999995 z ' id='1q25.1' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 39,42.492462499999974 11.382812500000002,0.0 0,-2.8499624999999895 -11.382812500000002,-0.0 0,2.8499624999999895 z ' id='1p35.2' style='fill:#fffafa;stroke:#797677;stroke-width:0.1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 50.169,175.28125 0.0,-1.9275 c 0.0,-0.9625 -1.1792500000000001,-2.5475 -2.923375,-3.45375 1.744125,-0.9062500000000001 2.923375,-2.4925 2.923375,-3.4575 l 0.0,-1.35875 -11.363375,-0.0 0.0,1.35875 c 0.0,0.96875 1.1875,2.55125 2.9405,3.4575 -1.7530000000000001,0.9050000000000001 -2.9405,2.48875 -2.9405,3.45375 l 0.0,1.9275 11.363375,0.0 ' id='centromere1-f' style='fill:#c8d7de;fill-opacity:1;fill-rule:nonzero;stroke:none' />
      <path d='m 50.169,175.28125 0.0,-1.9275 c 0.0,-0.9625 -1.1792500000000001,-2.5475 -2.923375,-3.45375 1.744125,-0.9062500000000001 2.923375,-2.4925 2.923375,-3.4575 l 0.0,-1.35875 -11.363375,-0.0 0.0,1.35875 c 0.0,0.96875 1.1875,2.55125 2.9405,3.4575 -1.7530000000000001,0.9050000000000001 -2.9405,2.48875 -2.9405,3.45375 l 0.0,1.9275 11.363375,0.0 z ' id='centromere1-o' style='fill:none;stroke:#797677;stroke-width:0.8;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='m 41.746125000000006,169.89874999999998 c -1.7538750000000003,0.9050000000000001 -2.9395,2.49 -2.9395,3.4562500000000003 l 0.0,172.331375 c 0.0,1.416 2.544,2.5633750000000006 5.681125,2.5633750000000006 3.13875,0.0 5.68025,-1.147375 5.68025,-2.5633750000000006 l 0.0,-172.331375 c 0.0,-0.96375 -1.1782500000000002,-2.54875 -2.921375,-3.4562500000000003 1.743125,-0.9050000000000001 2.921375,-2.49125 2.921375,-3.455 l 0.0,-162.24625 c 0.0,-1.41625 -2.5415000000000005,-2.5625000000000004 -5.68025,-2.5625000000000004 -3.1371250000000006,-0.0 -5.681125,1.14625 -5.681125,2.5625000000000004 l 0.0,162.24625 c 0.0,0.9662500000000002 1.185625,2.55 2.9395,3.455 z ' id='outline1' style='fill:none;stroke:#797677;stroke-width:0.8;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' />
      <path d='M 41.349625,169.935 0.0,169.935 ' id='centre1' style='fill:none;stroke:#231f20;stroke-width:0.8;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;display:none' />
      <text>
        <tspan id='label1' style='font-size:15px;font-variant:normal;font-weight:normal;writing-mode:lr-tb;fill:#797677;fill-opacity:1;fill-rule:nonzero;stroke:none;font-family:Helvetica;-inkscape-font-specification:Helvetica' x='40' y='365'> ${chromosomeNum} </tspan>
      </text>
    </g>
    `;
    return chromosome;
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

        //console.log(traitName)
        //console.log(circleConstruct)

        cx += displayGap;
        if (counter % maxOnARow == 0 && counter != 0) {
            cy += displayGap;
            cx = 75;
        }
    }
    return regionLine + circleConstruct;
}


function buildRegionData(data, transformXPos) {
    let regions = "";
    let regionLineYStart = 10;
    let regionLineYEnd = -0;
    let regionLineYStartInc = 0;
    let regionLineYEndInc = 0;
    let regionCount = 0;
    let traitCount = 0;
    let cx = 75;

    let avRegionLineYEnd = 0;

    let traitCountList = []
    let traitData = []
    let categoryData = []
    let regionData = [];

    data.forEach(function (obj) {
        regionCount = data.length;
        traitCount = obj.traits.length;

        traitCountList.push(traitCount)
        traitData.push(obj.traits)
        regionData.push(obj.region)
        categoryData.push(obj.categories)
        avRegionLineYEnd += (traitCount / maxOnARow) * 8
    })

    avRegionLineYEnd = avRegionLineYEnd / regionCount;

    regionLineYStart = 5;
    regionLineYStartInc = 10 // regionCount;
    regionLineYEnd = (regionCount * avRegionLineYEnd) / -2 //-450; //(regionCount * regionLineYEndInc) / -2
    regionLineYEndInc = 30; //(traitCount / 25) * 8;


    for (let i = 0; i < regionCount; i++) {
        regions += renderIcons(traitData[i], categoryData[i], regionData[i], cx, regionLineYStart, regionLineYEnd, transformXPos, 0);
        regionLineYStart += 10;
        regionLineYEnd += (traitCountList[i] / maxOnARow) * 8;
    }

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


let chromosomeNum = 1;
let transformXPos = 0;
let chromosome = "";
let data = "";
let regions = "";

getGraphData(chromosomeNum = 1).then((data) => {

    regions = buildRegionData(data, transformXPos = 0);
    chromosome = chromosomeGen(transformXPos = 0, chromosomeNum = 1);
    plotSVG(chromosome, regions);

    getGraphData(chromosomeNum = 2).then((data) => {
        regions += buildRegionData(data, transformXPos = 350);
        chromosome += chromosomeGen(transformXPos = 350, chromosomeNum = 2);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 3).then((data) => {
        regions += buildRegionData(data, transformXPos = 700);
        chromosome += chromosomeGen(transformXPos = 700, chromosomeNum = 3);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 4).then((data) => {
        regions += buildRegionData(data, transformXPos = 1050);
        chromosome += chromosomeGen(transformXPos = 1050, chromosomeNum = 4);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 5).then((data) => {
        regions += buildRegionData(data, transformXPos = 1400);
        chromosome += chromosomeGen(transformXPos = 1400, chromosomeNum = 5);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 6).then((data) => {
        regions += buildRegionData(data, transformXPos = 1750);
        chromosome += chromosomeGen(transformXPos = 1750, chromosomeNum = 6);
        plotSVG(chromosome, regions);
    });


    getGraphData(chromosomeNum = 7).then((data) => {
        regions += buildRegionData(data, transformXPos = 2100);
        chromosome += chromosomeGen(transformXPos = 2100, chromosomeNum = 7);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 8).then((data) => {
        regions += buildRegionData(data, transformXPos = 2450);
        chromosome += chromosomeGen(transformXPos = 2450, chromosomeNum = 8);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 9).then((data) => {
        regions += buildRegionData(data, transformXPos = 2800);
        chromosome += chromosomeGen(transformXPos = 2800, chromosomeNum = 9);
        plotSVG(chromosome, regions);
    });

    getGraphData(chromosomeNum = 10).then((data) => {
        regions += buildRegionData(data, transformXPos = 3150);
        chromosome += chromosomeGen(transformXPos = 3150, chromosomeNum = 10);
        plotSVG(chromosome, regions);
    });

});


function plotSVG(chromosome, regions) {
    icons.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' contentScriptType='text/ecmascript' width='4000' zoomAndPan='magnify' contentStyleType='text/css' viewBox='0 0 4000 4000' height='4000' id='goci-svg' preserveAspectRatio='xMinYMin slice' version='1.0'>
        <defs>
          <linearGradient y2='100%' id='blacktobg' x1='0%' x2='0%' y1='0%'>
            <stop style='stop-color:black;stop-opacity:1' offset='0%' />
            <stop style='stop-color:#fffaea;stop-opacity:1' offset='100%' />
          </linearGradient>
          <linearGradient y2='100%' id='bgtoblack' x1='0%' x2='0%' y1='0%'>
            <stop style='stop-color:#fffaea;stop-opacity:1' offset='0%' />
            <stop style='stop-color:black;stop-opacity:1' offset='100%' />
          </linearGradient>
          <mask width='3000' maskUnits='userSpaceOnUse' x='0' height='1700' y='-400' id='traitMask'>
            <rect fill='grey' x='0' width='3000' height='1700' y='-400' opacity='.25' />
          </mask>
        </defs>

        <g transform='translate(0,250)'>

          <text x='1750' y='-325' text-anchor='end' fill='#398A96' font-family='Verdana' font-size='70'></text>

          ${chromosome}
          ${regions}

        </g></svg>`
}

