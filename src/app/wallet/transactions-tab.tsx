import styles from './transactions-tab.module.css';
import {
    Anchor,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
    Badge,
    Pagination,
    Box,
    Loader,
    Tooltip,
} from '@mantine/core';
import {
    fetchTransactions,
    fetchTransactionCount,
    findTransactionsInMempool,
} from '../../lib/ledger';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IMempoolEntry } from '../../lib/kaspa-rpc/kaspa';
import { sompiToKas } from '../../lib/kaspa-util';
import { IconReplace } from '@tabler/icons-react';
import { ISelectedAddress } from './types';

const PAGE_SIZE = 10;

async function loadAddressTransactions(selectedAddress, setTransactions, page = 1, count = 0) {
    if (!selectedAddress) {
        setTransactions([]);
        return;
    }

    const maxPages = Math.ceil(count / PAGE_SIZE);
    const offset = Math.min(maxPages, page - 1) * PAGE_SIZE;
    const limit = page * PAGE_SIZE;

    const txsData = await fetchTransactions(selectedAddress.address, offset, limit);

    const processedTxData = txsData.map((tx) => {
        const myInputSum = tx.inputs.reduce((prev, curr) => {
            if (curr.previous_outpoint_address === selectedAddress.address) {
                return prev + curr.previous_outpoint_amount;
            }

            return prev;
        }, 0);
        const myOutputSum = tx.outputs.reduce((prev, curr) => {
            if (curr.script_public_key_address === selectedAddress.address) {
                return prev + curr.amount;
            }

            return prev;
        }, 0);

        return {
            key: tx.transaction_id,
            timestamp: format(new Date(tx.block_time), 'yyyy-MM-dd HH:mm:ss'),
            transactionId: tx.transaction_id,
            amount: (myOutputSum - myInputSum) / 100000000,
        };
    });

    setTransactions(processedTxData);
}

interface TransactionsTabProps {
    containerWidth: number;
    containerHeight: number;
    pendingTxId?: string;
    selectedAddress: ISelectedAddress;
    setMempoolEntryToReplace: (mempoolEntry: IMempoolEntry) => void;
    setActiveTab: (tab: string) => void;
}

export default function TransactionsTab(props: TransactionsTabProps) {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [txCount, setTxCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pendingTxs, setPendingTxs] = useState<IMempoolEntry[]>([]);
    const width = props.containerWidth;

    const maxPages = txCount ? Math.ceil(txCount / PAGE_SIZE) : 0;

    useEffect(() => {
        if (!props.selectedAddress) {
            return;
        }

        fetchTransactionCount(props.selectedAddress.address).then((count) => {
            setTxCount(count);
            setPage(1);
        });

        const address = props.selectedAddress.address;
        const handler = (result: any) => {
            const entry = result.entries[0];

            if (entry.address === address) {
                const newPendingTxs = entry.sending;

                setPendingTxs(newPendingTxs);

                if (pendingTxs.length == 0 && newPendingTxs.length > 0) {
                    // We're increasing the number of pending txs:
                } else if (newPendingTxs.length == 0 && pendingTxs.length > 0) {
                    // Transactions were pending but have confirmed:
                }
            }
        };

        // Look for pending txs when props.netTransactions changes or props.selectedAddress
        findTransactionsInMempool([address]).then(handler);
    }, [props.selectedAddress, props.pendingTxId]);

    useEffect(() => {
        if (page) {
            setLoading(true);
            loadAddressTransactions(props.selectedAddress, setTransactions, page, txCount).then(
                () => {
                    setLoading(false);
                },
            );
        }
    }, [page, txCount]);

    const pendingRows = pendingTxs.map((mempoolEntry: IMempoolEntry) => {
        const receipientAddress =
            mempoolEntry.transaction.outputs[0].verboseData.scriptPublicKeyAddress;
        let sentAmount = mempoolEntry.fee;
        if (receipientAddress != props.selectedAddress?.address) {
            sentAmount += mempoolEntry.transaction.outputs[0].value;
        }
        const transactionId = mempoolEntry.transaction.verboseData.transactionId;

        return (
            <Table.Tr key={transactionId}>
                <Table.Td>
                    <Group justify='space-between'>
                        <Group>
                            <Text
                                className={styles.transaction}
                                ff={'Roboto Mono,Courier New,Courier,monospace'}
                                fw={600}
                                c='gray.0'
                            >
                                <Text fw={600} c='brand' component='span'>
                                    {transactionId.substring(0, 6)}
                                </Text>
                                <Text fw={600} c='gray.0' component='span'>
                                    {transactionId.substring(6, transactionId.length - 8)}
                                </Text>
                                <Text fw={600} c='brand' component='span'>
                                    {transactionId.substring(
                                        transactionId.length - 8,
                                        transactionId.length,
                                    )}
                                </Text>
                            </Text>
                        </Group>

                        <Group>
                            <Badge
                                color='cyan'
                                leftSection={<Loader size={16} />}
                                rightSection={
                                    <Tooltip label='Initiate RBF'>
                                        <IconReplace
                                            size={16}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                // Set the tx to replace, and switch to overview:
                                                props.setMempoolEntryToReplace(mempoolEntry);
                                                props.setActiveTab('overview');
                                            }}
                                        />
                                    </Tooltip>
                                }
                            >
                                Pending
                            </Badge>
                            <Badge color='red'>-{sompiToKas(Number(sentAmount))}&nbsp;KAS</Badge>
                        </Group>
                    </Group>
                </Table.Td>
            </Table.Tr>
        );
    });

    const rows = (transactions || []).map((row) => {
        return (
            <Table.Tr key={row.transactionId}>
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
        <>
            <Box
                style={{
                    padding: 'var(--mantine-spacing-xs)',
                }}
            >
                <Group justify='space-between'>
                    <Group>
                        <Text fw={600}>Total Transactions: {txCount}</Text>
                        {loading ? <Loader size={20} /> : null}
                    </Group>

                    <Pagination total={maxPages} value={page} onChange={setPage}></Pagination>
                </Group>
            </Box>
            <Table className={styles.transactionTable}>
                <Table.Tbody>{pendingRows}</Table.Tbody>
            </Table>
            <ScrollArea.Autosize mah={600} mx='auto'>
                <Table className={styles.transactionTable}>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </ScrollArea.Autosize>
        </>
    );
}
