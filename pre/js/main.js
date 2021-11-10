import html2canvas from 'html2canvas';
import { getInTooltip, getOutTooltip, positionTooltip } from './tooltip';
import { setRRSSLinks } from './rrss';
import 'url-search-params-polyfill';
import * as d3 from 'd3';

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let dataSource = 'https://raw.githubusercontent.com/CarlosMunozDiazCSIC/envejecimiento_brecha-digital-2021_servicios/main/data/servicios_tic_2020.csv';
let tooltip = d3.select('#tooltip');

let innerData = [], nestedData = [];
let chartViz = d3.select('.chart__viz');
let chartBlockComunicacion = d3.select('#chart_comunicacion'), chartComunicacion, x1, xAxis1, y1, yAxis1, width1, height1;
let chartBlockInformacion = d3.select('#chart_informacion'), chartInformacion, x2, xAxis2, y2, yAxis2, width2, height2;
let chartBlockEntretenimiento = d3.select('#chart_entretenimiento'), chartEntretenimiento, x3, xAxis3, y3, yAxis3, width3, height3;
let chartBlockSalud = d3.select('#chart_salud'), chartSalud, x4, xAxis4, y4, yAxis4, width4, height4;
let chartBlockAprendizaje = d3.select('#chart_aprendizaje'), chartAprendizaje, x5, xAxis5, y5, yAxis5, width5, height5;
let chartBlockOtras = d3.select('#chart_otras'), chartOtras, x6, xAxis6, y6, yAxis6, width6, height6;
let currentSelected = 'ninguno';
let margin = {top: 5, right: 20, bottom: 17.5, left: 190};
let colors = ['#76B8B8', '#8F480D', '#d8d8d8'];

initData();

function initData() {
    let csv = d3.dsvFormat(';');

    d3.text(dataSource, function(err, data) {
        if(err) throw err;
        data = csv.parse(data);

        innerData = data.map(function(d) {
            return {
                servicio: d.servicio,
                servicio_padre: d.servicio_padre,
                servicio_abrev: d.servicio_abrev_viz,
                tipo: d.tipo,
                valor: +d.valor.replace(',','.')
            }
        });

        nestedData = d3.nest()
            .key(function(d) { return d.servicio_padre; })
            .entries(innerData);

        setComunicacion();
        setInformacion();
        setEntretenimiento();
        setSalud();    
        setAprendizaje();
        setOtras();  
    }); 
}

function updateChart(tipo) {
    console.log(tipo);

    //Círculos
    chartViz.selectAll(`.circle-${currentSelected}`).style('fill', colors[2]);
    chartViz.selectAll(`.circle-${tipo}`).style('fill', colors[1]);

    //Labels
    chartViz.selectAll(`.label-${currentSelected}`).style('opacity', '0');
    chartViz.selectAll(`.label-${tipo}`).style('opacity', '1');

    currentSelected = tipo;
}

function animateChart() {
    //Que evolucionen de nuevo con los mismos colores que tenían

    //Círculos 
    chart.selectAll(`.circle`)
        .style('opacity','0');

    chart.selectAll(`.circle-${currentSelected}`)
        .transition()
        .delay(3000)
        .duration(500)
        .style("fill", colors[1])
        .style('opacity', function(d,i) {
            if(i == 0 || i == 14) {
                return '1';
            } else {
                return '0';
            }
        });

    chart.selectAll(`.circle-65_74`)
        .transition()
        .delay(3000)
        .duration(500)
        .style("fill", colors[0])
        .style('opacity', function(d,i) {
            if(i == 0 || i == 14) {
                return '1';
            } else {
                return '0';
            }
        });
    
    //Labels
    chart.selectAll(`.label`)
        .style('opacity','0');

    chart.selectAll(`.label-${currentSelected}`)
        .transition()
        .delay(3000)
        .duration(500)
        .style('opacity', function(d,i) {
            if(i == 0 || i == 14) {
                return '1';
            } else {
                return '0';
            }
        });

    chart.selectAll(`.label-65_74`)
        .transition()
        .delay(3000)
        .duration(500)
        .style('opacity', function(d,i) {
            if(i == 0 || i == 14) {
                return '1';
            } else {
                return '0';
            }
        });
    
    //Líneas
    paths = chart.selectAll(".line");

    paths.attr("stroke-dasharray", 768 + " " + 768)
        .attr("stroke-dashoffset", 768)
        .transition()
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(3000);

    //Hacemos nueva fotografía de la visualización
    setTimeout(() => {
        setChartCanvas();
    }, 5000);
}

document.getElementById('replay').addEventListener('click', function() {
    animateChart();
});

//Helpers de visualización
function setComunicacion() {
    let dataCom = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[0].values);

    width1 = parseInt(chartBlockComunicacion.style('width')) - margin.left - margin.right,
    height1 = parseInt(chartBlockComunicacion.style('height')) - margin.top - margin.bottom;

    chartComunicacion = chartBlockComunicacion
        .append("svg")
            .attr("width", width1 + margin.left + margin.right)
            .attr("height", height1 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x1 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width1])
        .nice();        

    xAxis1 = function(g){
        g.call(d3.axisBottom(x1).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height1}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartComunicacion.append("g")
        .attr("transform", "translate(0," + height1 + ")")
        .call(xAxis1);

    //Estilos eje Y
    y1 = d3.scaleBand()
        .domain(dataCom.map(function(d) { return d.key; }))
        .range([height1, 0]);

    yAxis1 = function(svg){
        svg.call(d3.axisLeft(y1).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width1 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartComunicacion.append("g")
        .call(yAxis1);

    //Círculos para cada bloque
    for(let i = 0; i < dataCom.length; i++) {
        chartComunicacion.selectAll('init')
            .data(dataCom[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x1(+d.valor)})
            .attr("cy", function(d) { return y1(d.servicio_abrev) + y1.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataCom.length; i++) {
        chartComunicacion.selectAll('init')
            .data(dataCom[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x1(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y1(d.servicio_abrev) + (y1.bandwidth() / 2) - 12.5;
                } else {
                    return y1(d.servicio_abrev) + (y1.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

function setInformacion() {
    let dataInf = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[1].values);

    width2 = parseInt(chartBlockInformacion.style('width')) - margin.left - margin.right,
    height2 = parseInt(chartBlockInformacion.style('height')) - margin.top - margin.bottom;

    chartInformacion = chartBlockInformacion
        .append("svg")
            .attr("width", width2 + margin.left + margin.right)
            .attr("height", height2 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x2 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width2])
        .nice();        

    xAxis2 = function(g){
        g.call(d3.axisBottom(x2).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height2}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartInformacion.append("g")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    //Estilos eje Y
    y2 = d3.scaleBand()
        .domain(dataInf.map(function(d) { return d.key; }))
        .range([height2, 0]);

    yAxis2 = function(svg){
        svg.call(d3.axisLeft(y2).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width2 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartInformacion.append("g")
        .call(yAxis2);

    //Círculos para cada bloque
    for(let i = 0; i < dataInf.length; i++) {
        chartInformacion.selectAll('init')
            .data(dataInf[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x2(+d.valor)})
            .attr("cy", function(d) { return y2(d.servicio_abrev) + y2.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataInf.length; i++) {
        chartInformacion.selectAll('init')
            .data(dataInf[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x2(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y2(d.servicio_abrev) + (y2.bandwidth() / 2) - 12.5;
                } else {
                    return y2(d.servicio_abrev) + (y2.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

function setEntretenimiento() {
    let dataEnt = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[2].values);

    width3 = parseInt(chartBlockEntretenimiento.style('width')) - margin.left - margin.right,
    height3 = parseInt(chartBlockEntretenimiento.style('height')) - margin.top - margin.bottom;

    chartEntretenimiento = chartBlockEntretenimiento
        .append("svg")
            .attr("width", width3 + margin.left + margin.right)
            .attr("height", height3 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x3 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width3])
        .nice();        

    xAxis3 = function(g){
        g.call(d3.axisBottom(x3).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height3}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartEntretenimiento.append("g")
        .attr("transform", "translate(0," + height3 + ")")
        .call(xAxis3);

    //Estilos eje Y
    y3 = d3.scaleBand()
        .domain(dataEnt.map(function(d) { return d.key; }))
        .range([height3, 0]);

    yAxis3 = function(svg){
        svg.call(d3.axisLeft(y3).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width3 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartEntretenimiento.append("g")
        .call(yAxis3);

    //Círculos para cada bloque
    for(let i = 0; i < dataEnt.length; i++) {
        chartEntretenimiento.selectAll('init')
            .data(dataEnt[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x3(+d.valor)})
            .attr("cy", function(d) { return y3(d.servicio_abrev) + y3.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataEnt.length; i++) {
        chartEntretenimiento.selectAll('init')
            .data(dataEnt[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x3(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y3(d.servicio_abrev) + (y3.bandwidth() / 2) - 12.5;
                } else {
                    return y3(d.servicio_abrev) + (y3.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

function setSalud() {
    let dataSalud = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[3].values);

    width4 = parseInt(chartBlockSalud.style('width')) - margin.left - margin.right,
    height4 = parseInt(chartBlockSalud.style('height')) - margin.top - margin.bottom;

    chartSalud = chartBlockSalud
        .append("svg")
            .attr("width", width4 + margin.left + margin.right)
            .attr("height", height4 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x4 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width4])
        .nice();        

    xAxis4 = function(g){
        g.call(d3.axisBottom(x4).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height4}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartSalud.append("g")
        .attr("transform", "translate(0," + height4 + ")")
        .call(xAxis4);

    //Estilos eje Y
    y4 = d3.scaleBand()
        .domain(dataSalud.map(function(d) { return d.key; }))
        .range([height4, 0]);

    yAxis4 = function(svg){
        svg.call(d3.axisLeft(y4).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width4 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartSalud.append("g")
        .call(yAxis4);

    //Círculos para cada bloque
    for(let i = 0; i < dataSalud.length; i++) {
        chartSalud.selectAll('init')
            .data(dataSalud[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x4(+d.valor)})
            .attr("cy", function(d) { return y4(d.servicio_abrev) + y4.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataSalud.length; i++) {
        chartSalud.selectAll('init')
            .data(dataSalud[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x4(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y4(d.servicio_abrev) + (y4.bandwidth() / 2) - 12.5;
                } else {
                    return y4(d.servicio_abrev) + (y4.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

function setAprendizaje() {
    let dataAprendizaje = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[4].values);

    width5 = parseInt(chartBlockAprendizaje.style('width')) - margin.left - margin.right,
    height5 = parseInt(chartBlockAprendizaje.style('height')) - margin.top - margin.bottom;

    chartAprendizaje = chartBlockAprendizaje
        .append("svg")
            .attr("width", width5 + margin.left + margin.right)
            .attr("height", height5 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x5 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width5])
        .nice();        

    xAxis5 = function(g){
        g.call(d3.axisBottom(x5).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height5}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartAprendizaje.append("g")
        .attr("transform", "translate(0," + height5 + ")")
        .call(xAxis5);

    //Estilos eje Y
    y5 = d3.scaleBand()
        .domain(dataAprendizaje.map(function(d) { return d.key; }))
        .range([height5, 0]);

    yAxis5 = function(svg){
        svg.call(d3.axisLeft(y5).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width5 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartAprendizaje.append("g")
        .call(yAxis5);

    //Círculos para cada bloque
    for(let i = 0; i < dataAprendizaje.length; i++) {
        chartAprendizaje.selectAll('init')
            .data(dataAprendizaje[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x5(+d.valor)})
            .attr("cy", function(d) { return y5(d.servicio_abrev) + y5.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataAprendizaje.length; i++) {
        chartAprendizaje.selectAll('init')
            .data(dataAprendizaje[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x5(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y5(d.servicio_abrev) + (y5.bandwidth() / 2) - 12.5;
                } else {
                    return y5(d.servicio_abrev) + (y5.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

function setOtras() {
    let dataOtras = d3.nest()
        .key(function(d) { return d.servicio_abrev; })
        .entries(nestedData[5].values);

    width6 = parseInt(chartBlockOtras.style('width')) - margin.left - margin.right,
    height6 = parseInt(chartBlockOtras.style('height')) - margin.top - margin.bottom;

    chartOtras = chartBlockOtras
        .append("svg")
            .attr("width", width6 + margin.left + margin.right)
            .attr("height", height6 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Estilos para eje X
    x6 = d3.scaleLinear()
        .domain([0,100])
        .range([0, width6])
        .nice();        

    xAxis6 = function(g){
        g.call(d3.axisBottom(x6).ticks(5).tickFormat(function(d) { return d + '%'; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', `-${height6}`)
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chartOtras.append("g")
        .attr("transform", "translate(0," + height6 + ")")
        .call(xAxis6);

    //Estilos eje Y
    y6 = d3.scaleBand()
        .domain(dataOtras.map(function(d) { return d.key; }))
        .range([height6, 0]);

    yAxis6 = function(svg){
        svg.call(d3.axisLeft(y6).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width6 + '')
        })
        svg.call(function(g){g.select('.domain').remove()});
    }        

    chartOtras.append("g")
        .call(yAxis6);

    //Círculos para cada bloque
    for(let i = 0; i < dataOtras.length; i++) {
        chartOtras.selectAll('init')
            .data(dataOtras[i].values)
            .enter()
            .append('circle')
            .attr('class', function(d) {
                return `circle circle-${d.tipo}`;
            })
            .attr("r", '6')
            .attr("cx", function(d) { return x6(+d.valor)})
            .attr("cy", function(d) { return y6(d.servicio_abrev) + y5.bandwidth() / 2; })
            .style("fill", function(d) {
                if(d.tipo == '65_74'){
                    return colors[0];
                } else {
                    return colors[2];
                }
            })
            .style('opacity', '1');
    }

    //Labels para los círculos
    for(let i = 0; i < dataOtras.length; i++) {
        chartOtras.selectAll('init')
            .data(dataOtras[i].values)
            .enter()
            .append('text')
            .attr('class', function(d) {
                return `label label-${d.tipo}`;
            })
            .text(function(d) {
                return d.valor.toString().replace('.',',') + '%';
            })
            .attr("x", function(d) { return x6(+d.valor)})
            .attr("y", function(d) { 
                if(d.tipo == '65_74') {
                    return y6(d.servicio_abrev) + (y6.bandwidth() / 2) - 12.5;
                } else {
                    return y6(d.servicio_abrev) + (y6.bandwidth() / 2) + 17.5;
                } 
            })
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('opacity', function(d) {
                if(d.tipo == '65_74'){
                    return '1';
                } else {
                    return '0';
                }
            });
    }
}

///// REDES SOCIALES /////
setRRSSLinks();

///// ALTURA DEL BLOQUE DEL GRÁFICO //////
function getIframeParams() {
    const params = new URLSearchParams(window.location.search);
    const iframe = params.get('iframe');

    if(iframe == 'fijo') {
        setChartHeight('fijo');
    } else {
        setChartHeight();
    }
}

///Si viene desde iframe con altura fija, ejecutamos esta función. Si no, los altos son dinámicos a través de PYMJS
function setChartHeight(iframe_fijo) {
    if(iframe_fijo) {
        //El contenedor y el main reciben una altura fija
        //La altura del gráfico se ajusta más a lo disponible en el main, quitando títulos, lógica, ejes y pie de gráfico
        document.getElementsByClassName('container')[0].style.height = '612px';
        document.getElementsByClassName('main')[0].style.height = '580px';

        let titleBlock = document.getElementsByClassName('b-title')[0].clientHeight;
        let logicBlock = document.getElementsByClassName('chart__logics')[0].clientHeight;
        let footerBlock = document.getElementsByClassName('chart__footer')[0].clientHeight;
        let footerTop = 8, containerPadding = 8, marginTitle = 8, marginLogics = 12;

        //Comprobar previamente la altura que le demos al MAIN. El estado base es 588 pero podemos hacerlo más o menos alto en función de nuestros intereses

        let height = 580; //Altura total del main
        document.getElementsByClassName('chart__viz')[0].style.height = height - titleBlock - logicBlock - footerBlock - footerTop - containerPadding - marginTitle - marginLogics + 'px';
    } else {
        document.getElementsByClassName('main')[0].style.height = document.getElementsByClassName('main')[0].clientHeight + 'px';
    }    
}

getIframeParams();

///// DESCARGA COMO PNG O SVG > DOS PASOS/////
let innerCanvas;
let pngDownload = document.getElementById('pngImage');

function setChartCanvas() {
    html2canvas(document.querySelector("#chartBlock"), {width: document.querySelector('#chartBlock').clientWidth, height: document.querySelector('#chartBlock').clientHeight, imageTimeout: 12000, useCORS: true}).then(canvas => { innerCanvas = canvas; });
}

function setChartCanvasImage() {    
    var image = innerCanvas.toDataURL();
    // Create a link
    var aDownloadLink = document.createElement('a');
    // Add the name of the file to the link
    aDownloadLink.download = 'envejecimiento_brecha-digital-2021_servicios.png';
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
}

pngDownload.addEventListener('click', function(){
    setChartCanvasImage();
});

///// JUEGO DE PESTAÑAS /////
//Cambios de pestañas
let tabs = document.getElementsByClassName('tab');
let contenidos = document.getElementsByClassName('content');

for(let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function(e) {
        document.getElementsByClassName('main')[0].scrollIntoView();
        displayContainer(e.target);
    });
}

function displayContainer(elem) {
    let content = elem.getAttribute('data-target');

    //Poner activo el botón
    for(let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    elem.classList.add('active');

    //Activar el contenido
    for(let i = 0; i < contenidos.length; i++) {
        contenidos[i].classList.remove('active');
    }

    document.getElementsByClassName(content)[0].classList.add('active');
}

///// USO DE SELECTORES //////
let x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;

for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    let valores = selElmnt.options[j].value.split("-");
    c.setAttribute('data-value', valores[0]);
    c.setAttribute('data-type', valores[1]);
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        let y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        updateChart(e.target.getAttribute('data-value'));

        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  let x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);