import * as React from 'react';
import { IListItem } from '../../../services/SharePoint/IListItem';
import SharePointService from '../../../services/SharePoint/SharePointService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import styles from './Chart.module.scss';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import {
  Spinner,
  SpinnerSize,
} from 'office-ui-fabric-react/lib/Spinner';
import {
  MessageBar,
  MessageBarType,
} from 'office-ui-fabric-react/lib/MessageBar';
import * as strings from 'DashWebPartStrings';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

export interface IChartProps {
  listId: string;
  selectedFields: string[];
  chartType: string;
  chartTitle: string;
  colors: string[];
}

export interface IChartState {
  items: IListItem[];
  loading: boolean;
  error: string | null;
}

export default class Chart extends React.Component<IChartProps, IChartState> {
  constructor(props: IChartProps) {
    super(props);

    this.getItems = this.getItems.bind(this);
    this.chartData = this.chartData.bind(this);

    this.state = {
      items: [],
      loading: false,
      error: null,
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        <h1 className={styles.chartTitle}>{this.props.chartTitle}</h1>

        {this.state.error && <MessageBar messageBarType={MessageBarType.error}>{this.state.error}</MessageBar>}

        <div className={styles.chartBody}>
          {this.state.loading && (
            <Spinner
              className={styles.chartSpinner}
              size={SpinnerSize.large}
              label={strings.LoadingChartData}
              ariaLive="assertive"
            />
          )}
          {this.props.chartType === 'Bar' && <Bar data={this.chartData()} />}
          {this.props.chartType === 'Line' && <Line style={{height:"500px" ,width:500}} data={this.chartData()} />}
          {this.props.chartType === 'Pie' && <Pie data={this.chartData()} />}
          {this.props.chartType === 'Doughnut' && <Doughnut data={this.chartData()} />}
          {this.props.chartType === 'HorizontalBar' && (
            <Bar data={this.chartData() || []} options={{ indexAxis: 'y' }} />
          )}
        </div>
        <footer className={styles.chartFooter}>
          <ActionButton iconProps={{ iconName: 'Refresh' }} onClick={this.getItems} disabled={this.state.loading}>
            {this.state.loading ? strings.Loading : strings.Refresh}
          </ActionButton>
        </footer>
      </div>
    );
  }

  public componentDidMount(): void {
    this.getItems();
  }

  public getItems(): void {
    this.setState({ loading: true });

    SharePointService.getListItems(this.props.listId).then(items => {
      this.setState({
        items: items.value,
        loading: false,
        error: null,
      });
    }).catch(error => {
      this.setState({
        error: strings.Error,
        loading: false,
      });
    });
  }

  // public chartData(): any {
  //   const data: any = {
  //     labels: [],
  //     datasets: [],
  //   };

  //   this.state.items.map((item, i) => {
  //     const dataset: any = {
  //       label: '',
  //       data: [],
  //       backgroundColor: this.props.colors[i % this.props.colors.length],
  //       borderColor: this.props.colors[i % this.props.colors.length],
  //     };
  //     console.log(this.state.items);
  //     this.props.selectedFields.map((field, j) => {
  //       let value: any = item[field];
  //       if (value === undefined && item[`OData_${field}`] !== undefined) {
  //         value = item[`OData_${field}`];
  //       }

  //       if (i === 0 && j > 0) {
  //         data.labels.push(field);
  //       }

  //       if (j === 0) {
  //         dataset.label = value;
  //       } else {
  //         dataset.data.push(value);
  //       }
  //     });

  //     if (this.props.chartType === 'Line') {
  //       dataset['fill'] = false;
  //     }

  //     data.datasets.push(dataset || []);
  //   });

  //   return data;
  // }
  public chartData(): any {
    const data: any = {
      labels: [],
      datasets: [],
    };
    console.log(this.state.items);

    const map = new Map();
    let fields:any = []
    if (this.props.chartType === "Bar") {
      fields = ["field_7", "field_3"]
      this.state.items.forEach((item, i) => {
        fields?.forEach((field:any, j:number) => {
        let value: any = item[field] ?? item[`OData_${field}`];
  
        if (j > 0 && i === 0) {
          data.labels.push("Invest by amount");
        }
  
        if (j === 0) {
          if (!map.has(value)) {
            map.set(value, {
              label: value,
              data: [0], 
              backgroundColor: this.props.colors[i % this.props.colors.length],
              borderColor: this.props.colors[i % this.props.colors.length],
            });
          }
        } else {
          const dataset = map.get(item["field_7"]);
          if (dataset) {
            dataset.data[0] += value;
          }
        }
      });
      });
  
      data.datasets = Array.from(map.values());

    return data;

    }
    else if (this.props.chartType === "HorizontalBar") {
      fields = ["Investment_Date", "field_3"];
      let map:any = new Map();
      let data:any = {
        labels: [],
        datasets: []
      };
      this.state.items.forEach((item, i) => {
        fields?.forEach((field:any, j:number) => {
        let value: any = item[field] ?? item[`OData_${field}`];
  
        if (j > 0 && i === 0) {
          data.labels.push("Invest by amount");
        }
  
        if (j === 0) {
          if (!map.has(value)) {
            map.set(value, {
              label: value,
              data: [0], 
              backgroundColor: this.props.colors[i % this.props.colors.length],
              borderColor: this.props.colors[i % this.props.colors.length],
            });
          }
        } else {
          const dataset = map.get(item["Investment_Date"]);
          if (dataset) {
            dataset.data[0] += value;
          }
        }
      });
      });
      data.datasets = Array.from(map.values());
      data.datasets =data.datasets.sort((a:any, b:any) => a.label - b.label);

    
      
      return data;

    }
    else if (this.props.chartType === "Line") {
       fields = ["field_7", "Investment_Date", "field_3"];  // Investment Name, Investment Date (Year), and Investment Amount
      let map = new Map();  // Use the year and investment name as keys to store aggregated data
      let data:any = {
        labels: [],  // x-axis labels for years
        datasets: []  // Dataset for line chart
      };
    
      // Iterate through the items to process and group by year and investment name
      this.state.items.forEach((item) => {
        const investmentName = item["field_7"];  // Investment Name
        const year = item["Investment_Date"];  // Investment Date (Year)
        const investmentAmount = item["field_3"];  // Investment Amount
    
        if (!investmentName || !year || investmentAmount === undefined) {
          return;  // Skip invalid or incomplete data
        }
    
        if (!map.has(investmentName)) {
          map.set(investmentName, {});
        }
    
        const investmentData = map.get(investmentName);
    
        // Initialize the year in the map if it doesn't exist
        if (!investmentData[year]) {
          investmentData[year] = 0;
        }
    
        // Add the investment amount to the corresponding year
        investmentData[year] += investmentAmount;
      });
    
      // Now, populate the `labels` and `datasets` for the chart
      // Create a list of years and sort them for the x-axis
      const years = Array.from(
        new Set(
          this.state.items.map((item) => item["Investment_Date"])
        )
      ).sort((a, b) => a - b);  // Sort years
    
      data.labels = years;  // Set x-axis labels (years)
    
      // Create datasets for each investment name (each line on the chart)
      data.datasets = Array.from(map.keys()).map((investmentName, i) => {
        const investmentData = map.get(investmentName);
    
        return {
          label: investmentName,  // Investment name (label for the line)
          data: years.map((year) => investmentData[year] || 0),  // Sum investment amounts for each year
          backgroundColor: this.props.colors[i % this.props.colors.length],  // Assign color for the line
          borderColor: this.props.colors[i % this.props.colors.length],  // Border color for the line
          fill: false,  // Set false to avoid filling the area under the line
        };
      });
    
      return data;
    }
    
    
    else{
      return []
    }
    
//       else if(this.props.chartType === "Line"){
//     console.log(this.state.items, this.props.selectedFields);

//     // Define the fields to extract values from
//     fields = ['Investment_Date', 'Total_x0020_2020', 'Total_x0020_2021', 'Total_x0020_Invested'];

//     // Initialize labels array and dataset structure
//     let labels: string[] = [];
//     let datasets = [
//         {
//             label: 'Total 2020',
//             data: [],
//             borderColor: this.props.colors[0],  // Set color
//             backgroundColor: this.props.colors[0],
//             fill: false
//         },
//         {
//             label: 'Total 2021',
//             data: [],
//             borderColor: this.props.colors[1],  // Set color
//             backgroundColor: this.props.colors[1],
//             fill: false
//         },
//         {
//             label: 'Total Invested',
//             data: [],
//             borderColor: this.props.colors[2],  // Set color
//             backgroundColor: this.props.colors[2],
//             fill: false
//         }
//     ];

//     // Iterate through items to populate the labels and datasets
//     this.state.items.forEach((item) => {
//         const investmentName = item['investment_name']; // Extract investment name
//         const total2020 = item['Total_x0020_2020'] ?? 0;
//         const total2021 = item['Total_x0020_2021'] ?? 0;
//         const totalInvested = item['Total_x0020_Invested'] ?? 0;

//         // Push investment name to labels if not already added
//         if (!labels.includes(investmentName)) {
//             labels.push(investmentName);
//         }

//         // Push values to corresponding dataset
//         datasets[0].data.push(total2020);
//         datasets[1].data.push(total2021);
//         datasets[2].data.push(totalInvested);
//     });

//     // Return the data structure for the line chart
//     return {
//         labels: labels,
//         datasets: datasets
//     };
// }

    }
 

    

  }
