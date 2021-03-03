import { __decorate, __metadata } from "tslib";
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ChartComponent } from '../chart-component/chart-component';
let PriceChart = class PriceChart {
    constructor() {
        this.priceChange = new EventEmitter();
        this.loading = false;
    }
    initChartData(params) {
        const { data, color } = params;
        this.rates = data;
        const eventEmitter = this.priceChange;
        this.chartOptions = {
            series: [
                {
                    name: '',
                    data: this.rates
                }
            ],
            chart: {
                type: 'line',
                stacked: false,
                height: 350,
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: false
                },
                events: {
                    mouseMove(_event, _chart, options) {
                        const data = options.config.series[0].data;
                        const index = options.dataPointIndex;
                        if (data && data[index] && data[index][1]) {
                            eventEmitter.emit({
                                date: data[index][0],
                                price: data[index][1]
                            });
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                hover: {
                    size: 0
                }
            },
            tooltip: {
                followCursor: true,
                shared: false,
                x: {
                    show: false
                }
            },
            grid: {
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                show: false,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            xaxis: {
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                show: false,
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            stroke: {
                colors: [color],
                curve: 'straight',
                width: 2
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color
                }
            }
        };
    }
};
__decorate([
    ViewChild('chart'),
    __metadata("design:type", ChartComponent)
], PriceChart.prototype, "chart", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], PriceChart.prototype, "priceChange", void 0);
PriceChart = __decorate([
    Component({
        selector: 'price-chart',
        templateUrl: 'price-chart.html'
    }),
    __metadata("design:paramtypes", [])
], PriceChart);
export { PriceChart };
//# sourceMappingURL=price-chart.js.map