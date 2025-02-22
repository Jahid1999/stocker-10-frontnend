import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BbGraphService } from './bb-graph.service';

@Component({
  selector: 'app-com-bb-graph',
  templateUrl: './com-bb-graph.component.html',
  styleUrls: ['./com-bb-graph.component.scss'],
})
export class ComBbGraphComponent implements OnInit {
  chart: any;
  datapointsRange: any[] = [];
  datapointsCandle: any[] = [];
  datapointsAvg: any[] = [];
  companyCode: any;
  rangeData: any[] = [];
  candleData: any[] = [];
  smaData: any[] = [];
  getChartInstance(chart: object) {
    this.chart = chart;
    // let sma = this.calculateSMA(this.chartOptions.data[0].dataPoints, 7);
    this.chart.addTo('data', {
      type: 'line',
      showInLegend: true,
      markerSize: 0,
      color: 'red',
      yValueFormatString: '$#,###.00',
      name: 'Bollinger Bands',
      dataPoints: this.datapointsAvg,
    });
    this.addAverageSeries();
  }

  chartOptions = {
    zoomEnabled: true,
    zoomType: 'x',
    // title: {
    //   text: 'Technical Indicators: BB',
    // },
    // subtitles: [
    //   {
    //     text: 'Bollinger Bands',
    //   },
    // ],
    axisY: {
      title: 'Price',
      // prefix: '$',
    },
    axisX: {
      valueFormatString: 'MMM D',
    },
    legend: {
      verticalAlign: 'bottom',
      dockInsidePlotArea: 'inside',
      cursor: 'pointer',
      itemclick: function (e: any) {
        if (
          typeof e.dataSeries.visible === 'undefined' ||
          e.dataSeries.visible
        ) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      },
    },
    toolTip: {
      shared: true,
    },
    data: [
      {
        type: 'candlestick',
        showInLegend: true,
        name: 'Stock Price',
        yValueFormatString: '$#,###.00',
        xValueType: 'dateTime',
        color: "green",
        dataPoints: this.datapointsCandle,
      },
    ],
  };


  addAverageSeries() {
    let chart = this.chart;

    // theme: "light2",
    // exportEnabled: true,
    // title: {
    //   text: "Temperature Variation"
    // },
    // subtitles: [{
    //   text: "Bengaluru (India)"
    // }],
    // axisX: {
    //   valueFormatString: "MMM"
    // },
    // legend: {
    //   cursor: "pointer",
    //   dockInsidePlotArea: true,
    //   itemclick: function(e:any) {
    //     if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ){
    //         e.dataSeries.visible = false;
    //     } else {
    //         e.dataSeries.visible = true;
    //     }
    //     e.chart.render();
    //   }
    // },
    // toolTip: {
    //   shared: true
    // },
    chart.options.data.push({
      zoomEnabled: true,
      zoomType: 'x',
      type: 'rangeArea',
      name: 'Average',
      showInLegend: true,
      color: '#7986CB',
      // yValueFormatString: "##.0 °C",
      // xValueFormatString: "MMMM YYYY",
      toolTipContent:
        "{x}<br><span style='\"'color:{color}'\"'>Min</span>: {y[0]}<br><span style='\"'color:{color}'\"'>Max</span>: {y[1]}",
      markerSize: 0,
      dataPoints: this.datapointsRange,
    });
    chart.render();
  }
  constructor(private service: BbGraphService, private router: Router) {
    let text = router.url;
    let str = '';
    const myArray = text.split('/');
    // console.log(myArray)
    // let arr = myArray[2].split("%20")
    // for (let x of arr){
    //   str= str+x+' ';
    // }
    this.companyCode = myArray[2];
    // this.companyCode = this.companyCode.slice(0,-1)
  }
  ngOnInit(): void {
    this.service.recieveBbData(this.companyCode).subscribe((response: any) => {
      this.rangeData = response;
      let val: any;
      this.rangeData.forEach((val: any) => {
        let arr = [];
        arr.push(val.BOLD, val.BOLU);
        let time = this.toDateTime(val.DateEpoch);
        this.datapointsRange.push({ x: time, y: arr });
      });
      this.chart.render();
    });
    this.service.recieveCandleData(this.companyCode).subscribe((res: any) => {
      this.candleData = res;
      let val: any;
      this.candleData.forEach((val: any) => {
        let time = this.toEpochTime(val.x);

        this.datapointsCandle.push({ x: time, y: val.y });
      });
      this.chart.render();
    });
    this.service.recieveSMA(this.companyCode).subscribe((res: any) => {
      // console.log(res[0])
      this.smaData = res;
      const entries = Object.entries(this.smaData);
      entries.forEach((val: any) => {
        // console.log(val)
        const time = this.toDateTime(Number(val[0]));
        this.datapointsAvg.push({ x: time, y: val[1] });
      });

      this.chart.render();
    });
  }
  toDateTime(secs: number) {
    const result = new Date(secs);
    return result;
  }
  toEpochTime(date: string) {
    let myArray = date.split(' ');
    myArray = myArray[0].split('/');
    const time = myArray[2] + '-' + myArray[1] + '-' + myArray[0];
    return new Date(time);
  }
}
