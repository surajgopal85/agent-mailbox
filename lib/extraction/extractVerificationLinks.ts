function extractVerificationLinks(text: string): string[] {
    const regex: RegExp = /https?:\/\/[^\s]+/g;
    const matches = text.match(regex);
    const urlMatches: string[] = [];

    if (!matches) return [];

    for(const str of matches) {
        const trailingPdRegex: RegExp = /\.$/;
        const cleanUrl = str.replace(trailingPdRegex, "");
        try {
            let urlStr = new URL(cleanUrl);
            const pathname = urlStr.pathname.toLowerCase();
            if(
                pathname.includes("verify") ||
                pathname.includes("confirm") ||
                urlStr.searchParams.has("token") ||
                urlStr.searchParams.has("code")
            ) {
                urlMatches.push(urlStr.href);
            }
        } catch(err) {
            console.log(err);
        }
    }

    return urlMatches;
}

const text = `
Verify: https://example.com/verify?token=abc123.
Confirm: https://example.com/Confirm
Broken: https://
Homepage: https://example.com
`;

console.log(extractVerificationLinks(text));