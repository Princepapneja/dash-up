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
          {this.props.chartType === 'Line' && <Line data={this.chartData()} />}
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

  public chartData(): any {
    const data: any = {
      labels: [],
      datasets: [],
    };

    this.state.items.map((item, i) => {
      const dataset: any = {
        label: '',
        data: [],
        backgroundColor: this.props.colors[i % this.props.colors.length],
        borderColor: this.props.colors[i % this.props.colors.length],
      };
      this.props.selectedFields.map((field, j) => {
        let value: any = item[field];
        if (value === undefined && item[`OData_${field}`] !== undefined) {
          value = item[`OData_${field}`];
        }

        if (i === 0 && j > 0) {
          data.labels.push(field);
        }

        if (j === 0) {
          dataset.label = value;
        } else {
          dataset.data.push(value);
        }
      });

      if (this.props.chartType === 'Line') {
        dataset['fill'] = false;
      }

      data.datasets.push(dataset || []);
    });

    return data;
  }
}
