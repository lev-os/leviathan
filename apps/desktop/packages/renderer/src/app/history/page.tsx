import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function History() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trade History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-06-01</TableCell>
                <TableCell>$MPUP</TableCell>
                <TableCell>Buy</TableCell>
                <TableCell>10000</TableCell>
                <TableCell>$0.0025</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-05-28</TableCell>
                <TableCell>$GOAT</TableCell>
                <TableCell>Sell</TableCell>
                <TableCell>5000</TableCell>
                <TableCell>$0.0084</TableCell>
                <TableCell className="text-green-600">+12.8%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-05-25</TableCell>
                <TableCell>$TURBO</TableCell>
                <TableCell>Buy</TableCell>
                <TableCell>25000</TableCell>
                <TableCell>$0.00072</TableCell>
                <TableCell className="text-green-600">+20.5%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

