import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  MantineProvider,
  Container,
  Title,
  Text,
  Button,
  Table,
  Badge,
  Progress,
  Select,
  Group,
  Stack,
  Paper,
  CopyButton,
  Tooltip,
  ThemeIcon,
  Flex,
  Box,
} from "@mantine/core";
import {
  IconWifi,
  IconTrophy,
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "./App.css";

interface DnsServer {
  name: string;
  address: string;
  location: string;
  provider: string;
}

interface DnsResult {
  server: DnsServer;
  latency_ms: number | null;
  success: boolean;
  error: string | null;
}

// 延迟颜色映射
const getLatencyColor = (latency: number | null): string => {
  if (latency === null) return "gray";
  if (latency < 50) return "green";
  if (latency < 100) return "teal";
  if (latency < 200) return "yellow";
  return "red";
};

const getLatencyText = (latency: number | null): string => {
  if (latency === null) return "未测试";
  return `${latency}ms`;
};

function App() {
  const [results, setResults] = useState<DnsResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sortBy, setSortBy] = useState<"latency" | "provider" | "location">(
    "latency",
  );
  const [hasTested, setHasTested] = useState(false);

  const fetchDnsList = useCallback(async () => {
    try {
      const list: DnsServer[] = await invoke("get_dns_list");
      setResults(
        list.map((server) => ({
          server,
          latency_ms: null,
          success: false,
          error: null,
        })),
      );
    } catch (e) {
      console.error("Failed to fetch DNS list:", e);
    }
  }, []);

  useEffect(() => {
    fetchDnsList();
  }, [fetchDnsList]);

  // 模拟进度动画 - 10秒左右完成，带随机波动
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTesting) {
      setProgress(0);
      const baseIncrement = 0.9;

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          const randomFactor = (Math.random() - 0.3) * 0.9;
          const actualIncrement = Math.max(0.3, baseIncrement + randomFactor);
          return Math.min(prev + actualIncrement, 90);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTesting]);

  const testAll = async () => {
    setIsTesting(true);
    try {
      const testResults: DnsResult[] = await invoke("test_all_dns");
      setResults(testResults);
      setHasTested(true);
    } catch (e) {
      console.error("Test failed:", e);
    }
    setIsTesting(false);
    setProgress(100);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "latency":
        if (a.latency_ms === null) return 1;
        if (b.latency_ms === null) return -1;
        return a.latency_ms - b.latency_ms;
      case "provider":
        return a.server.provider.localeCompare(b.server.provider);
      case "location":
        return a.server.location.localeCompare(b.server.location);
      default:
        return 0;
    }
  });

  const fastest = results
    .filter((r) => r.latency_ms !== null)
    .sort((a, b) => (a.latency_ms || Infinity) - (b.latency_ms || Infinity))[0];

  // 状态图标
  const StatusIcon = ({ result }: { result: DnsResult }) => {
    if (result.success) {
      return (
        <ThemeIcon color="green" variant="light" size="sm" radius="xl">
          <IconCheck size={16} />
        </ThemeIcon>
      );
    }
    if (result.error) {
      return (
        <ThemeIcon color="red" variant="light" size="sm" radius="xl">
          <IconX size={16} />
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon color="gray" variant="light" size="sm" radius="xl">
        <IconClock size={16} />
      </ThemeIcon>
    );
  };

  return (
    <MantineProvider
      defaultColorScheme="dark"
      theme={{
        primaryColor: "cyan",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Box
        style={{
          minHeight: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "20px",
        }}
      >
        <Container size="xl">
          <Stack gap="lg">
            {/* Header */}
            <Paper
              p="xl"
              radius="md"
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
            >
              <Group justify="center" gap="xs" mb="xs">
                <IconWifi size={32} color="#00d4ff" />
                <Title order={1} style={{ color: "#fff" }}>
                  BestDNS
                </Title>
              </Group>
              <Text c="dimmed">测试常见 DNS 服务器的响应速度</Text>
            </Paper>

            {/* Controls */}
            <Paper p="md" radius="md" style={{ background: "rgba(0,0,0,0.2)" }}>
              <Group justify="center" gap="md">
                <Button
                  size="lg"
                  leftSection={isTesting ? undefined : <IconPlayerPlay size={20} />}
                  onClick={testAll}
                  disabled={isTesting}
                  loading={isTesting}
                  gradient={{ from: "cyan", to: "grape" }}
                  variant="gradient"
                  radius="xl"
                >
                  {isTesting ? "测试中..." : "开始测速"}
                </Button>

                <Select
                  label="排序方式"
                  value={sortBy}
                  onChange={(v) =>
                    setSortBy(v as "latency" | "provider" | "location")
                  }
                  data={[
                    { value: "latency", label: "按延迟" },
                    { value: "provider", label: "按提供商" },
                    { value: "location", label: "按地区" },
                  ]}
                  style={{ width: 150 }}
                />
              </Group>
            </Paper>

            {/* Progress */}
            {isTesting && (
              <Progress
                value={progress}
                size="md"
                radius="xl"
                striped
                animated
                color="cyan"
              />
            )}

            {/* Fastest Banner */}
            {hasTested && fastest && (
              <Paper
                p="md"
                radius="md"
                style={{
                  background: "rgba(0, 212, 255, 0.1)",
                  border: "1px solid #00d4ff",
                }}
              >
                <Flex align="center" justify="center" gap="sm" wrap="wrap">
                  <IconTrophy size={24} color="#FFD700" />
                  <Text fw={500}>最快:</Text>
                  <Text fw={700}>{fastest.server.name}</Text>
                  <Badge
                    size="lg"
                    variant="light"
                    style={{ fontFamily: "monospace" }}
                  >
                    {fastest.server.address}
                  </Badge>
                  <CopyButton value={fastest.server.address}>
                    {({ copied, copy }) => (
                      <Button
                        size="xs"
                        variant={copied ? "filled" : "light"}
                        color={copied ? "green" : "cyan"}
                        leftSection={
                          copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                        }
                        onClick={copy}
                      >
                        {copied ? "已复制" : "复制"}
                      </Button>
                    )}
                  </CopyButton>
                  <Badge
                    size="lg"
                    color={getLatencyColor(fastest.latency_ms)}
                  >
                    {getLatencyText(fastest.latency_ms)}
                  </Badge>
                </Flex>
              </Paper>
            )}

            {/* DNS Table */}
            <Paper
              radius="md"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <Table.ScrollContainer minWidth={700}>
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr style={{ background: "rgba(0, 0, 0, 0.3)" }}>
                      <Table.Th style={{ width: 60, textAlign: "center" }}>
                        状态
                      </Table.Th>
                      <Table.Th>DNS 服务器</Table.Th>
                      <Table.Th>地址</Table.Th>
                      <Table.Th>提供商</Table.Th>
                      <Table.Th>地区</Table.Th>
                      <Table.Th style={{ width: 100 }}>延迟</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedResults.map((result) => (
                      <Table.Tr
                        key={result.server.address}
                        style={
                          fastest?.server.address === result.server.address
                            ? {
                                background: "rgba(0, 212, 255, 0.1)",
                              }
                            : undefined
                        }
                      >
                        <Table.Td style={{ textAlign: "center" }}>
                          <StatusIcon result={result} />
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>{result.server.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <code
                              style={{
                                background: "rgba(0,0,0,0.3)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                              }}
                            >
                              {result.server.address}
                            </code>
                            <CopyButton value={result.server.address}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? "已复制" : "复制"}
                                  withArrow
                                >
                                  <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    color={copied ? "green" : "gray"}
                                    onClick={copy}
                                  >
                                    {copied ? (
                                      <IconCheck size={14} />
                                    ) : (
                                      <IconCopy size={14} />
                                    )}
                                  </Button>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Table.Td>
                        <Table.Td>{result.server.provider}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="gray">
                            {result.server.location}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {result.error ? (
                            <Badge color="red" variant="light">
                              超时
                            </Badge>
                          ) : (
                            <Badge
                              color={getLatencyColor(result.latency_ms)}
                              variant="filled"
                              size="lg"
                            >
                              {getLatencyText(result.latency_ms)}
                            </Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>

            {/* Legend */}
            <Paper p="md" radius="md" style={{ background: "rgba(0,0,0,0.2)" }}>
              <Text size="sm" c="dimmed" mb="xs">
                延迟说明
              </Text>
              <Group gap="lg">
                <Badge color="green" variant="dot">
                  &lt; 50ms 优秀
                </Badge>
                <Badge color="teal" variant="dot">
                  50-100ms 良好
                </Badge>
                <Badge color="yellow" variant="dot">
                  100-200ms 一般
                </Badge>
                <Badge color="red" variant="dot">
                  &gt; 200ms 较慢
                </Badge>
              </Group>
            </Paper>

            {/* Footer */}
            <Text size="xs" c="dimmed" ta="center">
              测试域名: www.baidu.com | 超时时间: 3秒
            </Text>
          </Stack>
        </Container>
      </Box>
    </MantineProvider>
  );
}

export default App;
