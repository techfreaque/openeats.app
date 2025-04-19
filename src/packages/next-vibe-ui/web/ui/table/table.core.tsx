// import {
//   Table as NativeTable,
//   TableBody as NativeTableBody,
//   TableCell as NativeTableCell,
//   TableHead as NativeTableHead,
//   TableHeader as NativeTableHeader,
//   TableRow as NativeTableRow,
// } from "./table.native";
import {
  Table as WebTable,
  TableBody as WebTableBody,
  TableCell as WebTableCell,
  TableHead as WebTableHead,
  TableHeader as WebTableHeader,
  TableRow as WebTableRow,
} from "./table.web";

export type {
  TableBodyProps,
  TableCellProps,
  TableHeaderProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
} from "./table.types";

export const Table =
  // envClient.platform.isReactNative ? NativeTable :
  WebTable;
export const TableHeader =
  // envClient.platform.isReactNative
  //   ? NativeTableHeader
  //   :
  WebTableHeader;
export const TableBody =
  // envClient.platform.isReactNative
  //   ? NativeTableBody
  //   :
  WebTableBody;
export const TableRow =
  // envClient.platform.isReactNative
  //   ? NativeTableRow
  //   :
  WebTableRow;
export const TableHead =
  // envClient.platform.isReactNative
  //   ? NativeTableHead
  //   :
  WebTableHead;
export const TableCell =
  // envClient.platform.isReactNative
  //   ? NativeTableCell
  //   :
  WebTableCell;
