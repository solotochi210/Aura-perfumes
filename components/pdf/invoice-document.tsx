import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Times-Roman", color: "#1c1612", backgroundColor: "#fbf8f4" },
  kicker: { fontFamily: "Helvetica", fontSize: 9, letterSpacing: 3, color: "#8a6a3d", marginBottom: 8 },
  title: { fontSize: 28, marginBottom: 8 },
  meta: { fontFamily: "Helvetica", fontSize: 10, color: "#433b34", marginBottom: 4 },
  rule: { borderBottomWidth: 1, borderBottomColor: "#e4d9cb", marginVertical: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  item: { fontFamily: "Helvetica", fontSize: 11, width: "70%" },
  price: { fontFamily: "Helvetica", fontSize: 11, width: "30%", textAlign: "right" },
  total: { fontSize: 16, marginTop: 8 },
  note: { fontFamily: "Helvetica", fontSize: 10, marginTop: 24, lineHeight: 1.5, color: "#433b34" },
  thanks: { fontSize: 18, marginTop: 40, textAlign: "center", letterSpacing: 1.5 },
  thanksNote: {
    fontFamily: "Helvetica",
    fontSize: 10,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 1.6,
    color: "#433b34",
  },
});

export function InvoiceDocument({
  kind,
  number,
  issuedAt,
  businessName,
  businessAddress,
  businessEmail,
  businessPhone,
  customerName,
  customerPhone,
  customerEmail,
  items,
  total,
  bankName,
  accountName,
  accountNumber,
}: {
  kind: "INVOICE" | "RECEIPT";
  number: string;
  issuedAt: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { label: string; amount: string }[];
  total: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>{businessName}</Text>
        <Text style={styles.title}>{kind === "RECEIPT" ? "Receipt" : "Invoice"}</Text>
        <Text style={styles.meta}>{number}</Text>
        <Text style={styles.meta}>{issuedAt}</Text>
        <View style={styles.rule} />
        <Text style={styles.meta}>Bill to</Text>
        <Text style={styles.meta}>{customerName}</Text>
        <Text style={styles.meta}>{customerPhone}</Text>
        <Text style={styles.meta}>{customerEmail}</Text>
        <View style={styles.rule} />
        {items.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.item}>{item.label}</Text>
            <Text style={styles.price}>{item.amount}</Text>
          </View>
        ))}
        <View style={styles.rule} />
        <View style={styles.row}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>{total}</Text>
        </View>
        {kind === "INVOICE" && accountNumber ? (
          <Text style={styles.note}>
            {`Transfer to ${bankName}, ${accountName}, ${accountNumber}.`}
          </Text>
        ) : null}
        <Text style={styles.note}>
          {[businessAddress, businessEmail, businessPhone].filter(Boolean).join(" · ")}
        </Text>
        {kind === "RECEIPT" ? (
          <View>
            <Text style={styles.thanks}>THANK YOU, COME AGAIN</Text>
            <Text style={styles.thanksNote}>
              {`It was a pleasure to prepare this for you, ${customerName.trim().split(/\s+/)[0] || "friend"}. Wear it close, and return whenever you wish.`}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  props: Parameters<typeof InvoiceDocument>[0],
) {
  return renderToBuffer(<InvoiceDocument {...props} />);
}