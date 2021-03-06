// import Plotly from 'plotly.js/lib/core';
import { dataTable } from '@/store/data-store';
import { mean, deviation } from 'd3';

const potatoSampleOrder = ['00','01','02','03','04','05','06','07','08','09','11'];

/**
 * @typedef {import('../store/plot-store').PlotOptions} PlotOptions
 */

export const colors = ['#c7566f', '#57bf67', '#845ec9', '#90b83d', '#d3a333','#c363ab', '#4a7c38', '#adab63', '#698ccc', '#c94f32', '#826627', '#52b8a4', '#d88e61'];

const lineStyles = ['solid', 'dot', 'dash', 'longdash', 'dashdot', 'longdashdot'];
const markerStyles = ['circle','square','diamond', 'cross', 'triangle-up','pentagon'];


/**
 *
 * @param {boolean} showlegend show the legend of the plot
 * @param {string} accessionId accessionId to plot the data for
 * @param {string} countUnit unit used for the y-label
 */
function getDefaultLayout(showlegend, countUnit, plotTitle) {
  return {
    title: {
      text: plotTitle,
      font: {
        family: 'ABeeZee',
        size: 24
      },
      y: 0.9,
    },
    showlegend,
    legend: {
      orientation:'h',
      x: 0,
      y: -0.30,

    },
    yaxis: {
      title:{
        text: 'count [raw]' // access to the unit needs to be variable
      },
      hoverformat: '.2f'
    },
    xaxis: {
      tickangle: 'auto',
      dtick: 1
    },
    colorway: colors,
  };
}

/**
 * create a single Gene grouped Plot. That can be either single-gene Bar or single-gene individual curves
 * @param {string[]} accessionIds
 * @param {PlotOptions} options
 */
export function singleGeneGroupedPlot(accessionIds, options) {
  let accessionId = accessionIds[0];
  let plotData = dataTable.getRowAsTree(accessionId);

  let data = createGroupedPlotFromGene(plotData, accessionId, options);
  let layout = getDefaultLayout(options.showlegend, options.countUnit, options.plotTitle);

  return {data, layout, config: options.config, accessions: accessionIds, showCaption: options.showCaption, plotId: options.plotId};
}


/**
 * create a plotly multi gene bar plot
 * @param {string[]} accessionIds
 * @param {PlotOptions} options
 */
export function multiGeneBarPlot(accessionIds, options){
  let data = [];
  accessionIds.forEach(accession => {
    let plotData = dataTable.getRowAsGroups(accession,1);
    let x = [[],[]];
    let y = [];
    let error_y = [];
    let groupIndex = 0;
    let group = '';
    plotData.forEach((value, key) => {

      if (key[0] !== group) {
        groupIndex++;
      }
      
      group = key[0];

      // x[0].push(key[0]);
      x[0].push(`G${groupIndex}`);
      x[1].push(key[1]);
      y.push(mean(value));
      error_y.push(deviation(value));
    });
    data.push(createTrace(x,y,error_y,accession, 'bar', options.showlegend));
  });

  let layout = getDefaultLayout(options.showlegend, options.countUnit, options.plotTitle);
  return {data, layout, config: options.config, accessions: accessionIds, showCaption: options.showCaption, plotId: options.plotId};
}

/**
 * create a plolty multi Gene individual curves plot
 * @param {string[]} accessionIds
 * @param {PlotOptions} options
 */
export function multiGeneIndCurvesPlot(accessionIds, options) {
  let data = [];
  accessionIds.forEach((accession,index) => {
    const plotData = dataTable.getRowAsTree(accession);
    const line = {
      color : colors[index],
    };
    // showLegendCurve = index > 0 ? false : true;
    data.push(...createGroupedPlotFromGene(plotData, accession, options, line, true));

  });

  let layout = getDefaultLayout(options.showlegend, options.countUnit, options.plotTitle);
  return {data, layout, config: options.config, accessions: accessionIds, showCaption: options.showCaption, plotId: options.plotId};
}

/**
 * create a plolty stacked line-plot
 * @param {string[]} accessionIds
 * @param {PlotOptions} options
 */
export function stackedLinePlot(accessionIds, options) {
  let data = [];
  let colorIndex = 0;
  let styleIndex = 0;
  let line = null;
  let marker = null;
  accessionIds.forEach(accession => {
    let plotData = dataTable.getRowAsTree(accession);
    Object.keys(plotData).forEach(groupName => {
      let name = groupName;
      let x = [];
      let y = [];
      let error_y = [];
      if (accessionIds.length > 1) {
        line = {
          color: colors[colorIndex],
          dash: lineStyles[styleIndex]
        };
        marker = {
          symbol: markerStyles[styleIndex]
        };
        name = `${groupName} - ${accession}`;
      }
      options.colorBy === 'group' ? colorIndex++ : styleIndex++;
      let sampleOrder = potatoSampleOrder.filter( x => Object.keys(plotData[groupName]).includes(x));
      sampleOrder.forEach(sampleName => {
        x.push(sampleName);
        y.push(mean(plotData[groupName][sampleName]));
        error_y.push(deviation(plotData[groupName][sampleName]));
      });
      data.push(createTrace(x,y,error_y, name, 'scatter', options.showlegend, line, marker));
    });
    options.colorBy === 'group' ? (colorIndex = 0, styleIndex++) : (colorIndex++, styleIndex = 0);
  });

  let layout = getDefaultLayout(options.showlegend, options.countUnit, options.plotTitle);
  return {data, layout, config: options.config, accessions: accessionIds, showCaption: options.showCaption, plotId: options.plotId};
}

/**
 * creates one "group" of single-gene bar/individual-curves or multi-gene individual curves
 * @param {string[]} accessionIds
 * @param {PlotOptions} options
 */
function createGroupedPlotFromGene(plotData, accessionId, options, line, showOnlyFirstLegend = false) {
  let data = [];
  let type = options.plotType === 'bars' ? 'bar' : 'scatter';
  let groupIndex = 1;
  Object.keys(plotData).forEach((groupName, index) => {
    let traceName = showOnlyFirstLegend ? accessionId : groupName;
    let x = [[],[]];
    let y = [];
    let error_y = [];
    let sampleOrder = potatoSampleOrder.filter( x => Object.keys(plotData[groupName]).includes(x));
    sampleOrder.forEach(sampleName => {
      x[0].push(`G${groupIndex}`);
      x[1].push(sampleName);
      y.push(mean(plotData[groupName][sampleName]));
      error_y.push(deviation(plotData[groupName][sampleName]));
    });
    groupIndex++;
    let showlegend = showOnlyFirstLegend ? ( index > 0 ? false : true ) : true;
    data.push(createTrace(x,y,error_y, traceName, type, showlegend, line));
  });
  return data;
}

/**
 * create a generic plotly trace
 * @param {array} x
 * @param {array} y
 * @param {array} error_y
 * @param {string} name
 * @param {string} type
 * @param {boolean} showlegend
 * @param {object} line
 * @param {object} marker
 */
function createTrace(x, y, error_y, name, type, showlegend, line, marker) {
  return {
    x,
    y,
    error_y: {
      type: 'data',
      array: error_y,
      visible: true
    },
    type,
    name,
    showlegend,
    ...(line && {line}),
    ...(marker && {marker})
  };
}