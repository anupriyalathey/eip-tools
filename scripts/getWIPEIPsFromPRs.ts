import { updateFileData } from "./fetchValidEIPs";
const MAX_RETRIES = 5;

async function fetchWithRetry(
  url: string,
  options: any,
  retries = MAX_RETRIES
): Promise<any> {
  try {
    return await axios.get(url, options);
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... (${MAX_RETRIES - retries + 1})`);
      await new Promise((res) =>
        setTimeout(res, 1000 * (MAX_RETRIES - retries + 1))
      ); // Exponential backoff
      return fetchWithRetry(url, options, retries - 1);
    } else {
      throw error;
    }
  }
}

async function getOpenPRNumbers(
  orgName: string,
  repo: string
): Promise<Array<number>> {
  console.log(`Fetching open PRs for ${orgName}/${repo}...`);
    const apiUrl = `https://api.github.com/repos/${orgName}/${repo}/pulls?state=open`;
    const response = await fetchWithRetry(apiUrl, { headers });
async function getPRData(orgName: string, prNumber: number, repo: string) {
  const apiUrl = `https://api.github.com/repos/${orgName}/${repo}/pulls/${prNumber}`;
    const response = await fetchWithRetry(apiUrl, { headers });
async function getEIPNoFromDiff(
  diffUrl: string,
  folderName: string,
  filePrefix: string
) {
    const response = await fetchWithRetry(diffUrl, {});
        if (filePath.includes(`${folderName}/`)) {
          eipNumber = extractEIPNumber(filePath, folderName, filePrefix);
function extractEIPNumber(
  filePath: string,
  folderName: string,
  filePrefix: string
) {
  const regex = new RegExp(`b/${folderName}/${filePrefix}-(\\d+)\\.md`);
const fetchDataFromOpenPRs = async ({
  orgName,
  repo,
  folderName,
  filePrefix,
  isERC,
}: {
  orgName: string;
  repo: string;
  folderName: string;
  filePrefix: string;
  isERC?: boolean;
}) => {
  const prNumbers = await getOpenPRNumbers(orgName, repo);
  await Promise.all(
    prNumbers.map(async (prNo) => {
      const prData = await getPRData(orgName, prNo, repo);
      if (!prData) return;
      const { diffUrl, repoOwnerAndName, branchName } = prData;
      const eipNo = await getEIPNoFromDiff(diffUrl, folderName, filePrefix);

      if (eipNo > 0) {
        const markdownPath = `https://raw.githubusercontent.com/${repoOwnerAndName}/${branchName}/${folderName}/${filePrefix}-${eipNo}.md`;
        const eipMarkdownRes: string = (await fetchWithRetry(markdownPath, {}))
          .data;
        const { metadata } = extractMetadata(eipMarkdownRes);
        const { title, status } = convertMetadataToJson(metadata);

        console.log(`Found WIP ${filePrefix}: ${eipNo}: ${title}`);

        result[eipNo] = {
          title,
          status,
          isERC,
          prNo,
          markdownPath,
        };
      }
    })
  );
const updateEIPData = async () => {
  const resOpenEIPs = await fetchDataFromOpenPRs({
    orgName: "ethereum",
    repo: "EIPs",
    folderName: "EIPS",
    filePrefix: "eip",
  });
  const resOpenERCs = await fetchDataFromOpenPRs({
    orgName: "ethereum",
    repo: "ERCs",
    folderName: "ERCS",
    filePrefix: "erc",
    isERC: true,
  });
  const result = { ...resOpenEIPs, ...resOpenERCs };

  updateFileData(result, "valid-eips.json");
};
const updateRIPData = async () => {
  const resOpenRIPs = await fetchDataFromOpenPRs({
    orgName: "ethereum",
    repo: "RIPs",
    folderName: "RIPS",
    filePrefix: "rip",
  });
  updateFileData(resOpenRIPs, "valid-rips.json");
};
const updateCAIPData = async () => {
  const resOpenCAIPs = await fetchDataFromOpenPRs({
    orgName: "ChainAgnostic",
    repo: "CAIPs",
    folderName: "CAIPs",
    filePrefix: "caip",
  });
  updateFileData(resOpenCAIPs, "valid-caips.json");
};

const main = async () => {
  updateEIPData();
  updateRIPData();
  updateCAIPData();