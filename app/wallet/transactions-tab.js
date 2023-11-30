import styles from './transactions-tab.module.css';
import { Anchor, Group, ScrollArea, Stack, Table, Text, Badge } from '@mantine/core';

export default function TransactionsTab(props) {
    const width = props.containerWidth;

    const rows = (props.transactions || []).map((row) => {
        return (
            <Table.Tr key={row.key}>
                <Table.Td>
                    <Stack>
                        <Group justify='space-between'>
                            <Text>{row.timestamp}</Text>
                            <Badge color={row.amount <= 0 ? 'red' : 'green'}>
                                {row.amount}&nbsp;KAS
                            </Badge>
                        </Group>

                        <Anchor
                            href={`https://explorer.kaspa.org/txs/${row.transactionId}`}
                            target='_blank'
                            className={styles.transaction}
                            ff={'Roboto Mono,Courier New,Courier,monospace'}
                            fw={600}
                            c='gray.0'
                            w={width - 64}
                        >
                            <Text fw={600} c='brand' component='span'>
                                {row.transactionId.substring(0, 6)}
                            </Text>
                            <Text fw={600} c='gray.0' component='span'>
                                {row.transactionId.substring(6, row.transactionId.length - 8)}
                            </Text>
                            <Text fw={600} c='brand' component='span'>
                                {row.transactionId.substring(
                                    row.transactionId.length - 8,
                                    row.transactionId.length,
                                )}
                            </Text>
                        </Anchor>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <ScrollArea.Autosize mah={600} mx='auto'>
            <Table className={styles.transactionTable}>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea.Autosize>
    );
}
