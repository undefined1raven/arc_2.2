We need a high lvl api that handles chunking logic very easily.

Methods:
appendEntry(tableName: string, rowData: any)
getDataInTimeRange(tableName: string, from: number(unix ts), to: number(unix ts))
removeEntry(tableName: string, matcher: any)
