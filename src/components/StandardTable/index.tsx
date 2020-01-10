import { Table, Alert } from 'antd';
import { ColumnProps, TableProps, TableRowSelection } from 'antd/es/table';
import React, { PureComponent, Fragment } from 'react';

import styles from './index.less';

function initTotalList<T>(
  columns: StandardTableColumnProps<T>[],
): StandardTableColumnProps<T> & { total: number }[] {
  const totalList: StandardTableColumnProps<T> & { total: number }[] = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

export interface StandardTableColumnProps<T = {}> extends ColumnProps<T> {
  needTotal?: boolean;
  total?: number;
}

export interface StandardTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: StandardTableColumnProps<T>[];
  data: {
    list: T[];
    pagination: TableProps<T>['pagination'];
  };
}

interface StandardTableState {
  selectedRowKeys: string[] | number[];
  needTotalList: StandardTableColumnProps[];
}

class StandardTable<T = {}> extends PureComponent<StandardTableProps<T>, StandardTableState> {
  constructor(props: StandardTableProps<T>) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);
    this.state = {
      selectedRowKeys: [],
      needTotalList,
    };
  }

  handleRowSelectChange: TableRowSelection<T>['onChange'] = (selectedRowKeys, selectedRows) => {
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex as string]), 0),
    }));
    const { rowSelection } = this.props;
    if (rowSelection) {
      if (rowSelection.onChange) {
        rowSelection.onChange(selectedRowKeys, selectedRows);
      }
    }
    this.setState({ selectedRowKeys, needTotalList });
  };

  cleanSelectedKeys = () => {
    // @ts-ignore
    this.handleRowSelectChange([], []);
  };

  handleTableChange: TableProps<T>['onChange'] = (pagination, filters, sorter, ...rest) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter, ...rest);
    }
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data, rowKey, ...rest } = this.props;
    const { list = [], pagination = false } = data || {};
    // 设置分页的属性 // 页码可以快搜，可以改变每页显示数据条数。
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: (record: T) => ({
        disabled: (record as T & { disabled: boolean }).disabled,
      }),
    };
    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                {needTotalList.map((item, index) => (
                  <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                    {item.title}
                    总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                      {item.render ? item.render(item.total, {}, index) : item.total}
                    </span>
                  </span>
                ))}
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        <Table
          {...rest}
          rowKey={rowKey || 'key'}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={paginationProps}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
