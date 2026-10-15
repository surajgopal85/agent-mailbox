export function extractVerificationCodes(text: string): string[] {
    const regex = /\b\d{6}\b/g;
    const matches = text.match(regex);
    return matches ?? [];
}

// console.log(extractVerificationCodes("js is fun 123456"));
// console.log(extractVerificationCodes("Your code is 123 12334 123488 bye"));
// console.log(extractVerificationCodes("Code: 123456 or 789012"));
// console.log(extractVerificationCodes("Code: 012345"));
// console.log(extractVerificationCodes("Reference: 1234567"));
// console.log(extractVerificationCodes("Code: (482913)."));