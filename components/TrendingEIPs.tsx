import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  GridItem,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  Flex,
} from "@chakra-ui/react";
import { validEIPs } from "@/data/validEIPs";
import { EIPStatus } from "@/utils";

interface TrendingEIP {
  _id: number;
  count: number;
}

const EIPGridItem = ({ eipNo }: { eipNo: number }) => {
  const router = useRouter();

  const eip = validEIPs[eipNo];

  return (
    <Box
      flex={1}
      minW="15rem"
      minH="5rem"
      p="4"
      mr={"2"}
      border="2px solid"
      borderColor={"gray.500"}
      bg={"white"}
      color={"black"}
      cursor={"pointer"}
      transition="all 0.1s ease-in-out"
      _hover={{
        bgColor: "gray.600",
        color: "white",
        borderColor: "blue.300",
      }}
      onClick={() => {
        router.push(`/eip/${eipNo}`);
      }}
      rounded="lg"
    >
      {eip ? (
        <>
          {eip.status && (
            <Badge
              p={1}
              bg={EIPStatus[eip.status]?.bg ?? "cyan.500"}
              fontWeight={700}
              rounded="md"
            >
              {EIPStatus[eip.status]?.prefix} {eip.status}
            </Badge>
          )}
          <Heading mt={2} fontSize={{ sm: "25", md: "30", lg: "30" }}>
            {eip.isERC ? "ERC" : "EIP"}-{eipNo}
          </Heading>
          <Text>{eip.title}</Text>
        </>
      ) : (
        <Heading mt={2} fontSize={{ sm: "25", lg: "30" }}>
          EIP-{eipNo}
        </Heading>
      )}
    </Box>
  );
};

export const TrendingEIPs = () => {
  const [trendingEIPs, setTrendingEIPs] = useState<TrendingEIP[]>([]);

  useEffect(() => {
    const fetchTrendingPages = async () => {
      const response = await fetch("/api/getTrendingEIPs");
      const data = await response.json();
      setTrendingEIPs(data);
    };

    fetchTrendingPages();
  }, []);

  return (
    <Box mt={10} px={10}>
      <Box>
        <Heading>Trending EIPs 💹</Heading>
        <Text fontSize={"md"} fontWeight={200}>
          (Most viewed: Last 7 days)
        </Text>
      </Box>
      <Box mt={4} overflowX="auto">
        <Flex direction="row" minW="max-content" pb="2">
          {trendingEIPs.length > 0
            ? trendingEIPs.map(({ _id: eipNo }) => (
                <EIPGridItem key={eipNo} eipNo={eipNo} />
              ))
            : [1, 2, 3].map((i) => <Skeleton key={i} h="10rem" rounded="lg" />)}
        </Flex>
      </Box>
    </Box>
  );
};