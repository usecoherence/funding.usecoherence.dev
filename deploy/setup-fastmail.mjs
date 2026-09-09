#!/usr/bin/env node

const token = process.env.FASTMAIL_API_TOKEN;
const accountId = process.env.FASTMAIL_ACCOUNT_ID;
const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

if (!token) {
  console.error("missing FASTMAIL_API_TOKEN");
  process.exit(1);
}

const apiUrl = "https://api.fastmail.com/jmap/api/";
const sessionUrl = "https://api.fastmail.com/jmap/session/";

async function jmap(using, methodCalls) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ using, methodCalls }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function getSession() {
  const res = await fetch(sessionUrl, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  // Auto-discover capabilities and account
  const session = await getSession();
  const caps = Object.keys(session.capabilities);
  const useAlias = caps.includes("https://www.fastmail.com/dev/customer");
  const useMasked = caps.includes("https://www.fastmail.com/dev/maskedemail");

  const resolvedAccountId = accountId || Object.values(session.primaryAccounts)[0];
  const username = session.username;

  const cmd = process.argv[2];

  if (cmd === "discover") {
    const ids = Object.keys(session.accounts);
    console.log("Account ID:", ids[0]);
    console.log("Username:", username);
    console.log("Capabilities:", useAlias ? "Alias API (customer)" : useMasked ? "MaskedEmail API" : "none");
    if (ids.length === 1) {
      console.log(`\nAdd to .env:\nFASTMAIL_ACCOUNT_ID=${ids[0]}`);
    }
    return;
  }

  if (!resolvedAccountId) {
    console.error("could not determine accountId; run 'discover'");
    process.exit(1);
  }

  if (!useAlias && !useMasked) {
    console.error("token has no alias or maskedemail capability");
    process.exit(1);
  }

  const list = async () => {
    if (useAlias) {
      const using = ["urn:ietf:params:jmap:core", "https://www.fastmail.com/dev/user", "https://www.fastmail.com/dev/customer"];
      const res = await jmap(using, [["Alias/get", { accountId: resolvedAccountId, ids: null }, "0"]]);
      const items = res.methodResponses[0][1].list || [];
      if (items.length === 0) { console.log("  no aliases"); return; }
      for (const a of items) {
        console.log(`  ${a.email} -> ${a.targetEmails?.join(", ") || "(no target)"}`);
      }
    } else {
      const using = ["urn:ietf:params:jmap:core", "https://www.fastmail.com/dev/maskedemail"];
      const res = await jmap(using, [["MaskedEmail/get", { accountId: resolvedAccountId, ids: null }, "0"]]);
      const items = res.methodResponses[0][1].list || [];
      if (items.length === 0) { console.log("  no masked emails"); return; }
      for (const m of items) {
        const domain = m.forDomain ? ` (for ${m.forDomain})` : "";
        console.log(`  ${m.email} [${m.state}]${domain}${m.description ? ` — ${m.description}` : ""}`);
      }
    }
    console.log(`  ${items.length} total`);
    return items;
  };

  if (!cmd || cmd === "list") {
    await list();
    return;
  }

  if (cmd === "create") {
    if (!useAlias) {
      // MaskedEmail: generate random alias, optionally for a domain
      const forDomain = process.argv[3] || "usecoherence.dev";
      const description = process.argv[4] || "";

      if (dryRun) { console.log(`  [DRY RUN] create masked email for ${forDomain}`); return; }

      const using = ["urn:ietf:params:jmap:core", "https://www.fastmail.com/dev/maskedemail"];
      const res = await jmap(using, [["MaskedEmail/set", {
        accountId: resolvedAccountId,
        create: {
          new: { forDomain, description, state: "enabled" },
        },
      }, "0"]]);

      const result = res.methodResponses[0][1];
      if (result.created) {
        const created = result.created.new;
        console.log(`  created ${created.email} [${created.state}] for ${forDomain}${description ? ` — ${description}` : ""}`);
      } else {
        console.error("  failed:", JSON.stringify(result, null, 2));
        process.exit(1);
      }
      return;
    }

    // Alias API
    const alias = process.argv[3];
    if (!alias) {
      console.error("usage: ... create <email> [target]");
      process.exit(1);
    }
    const target = process.argv[4] || username;

    if (dryRun) { console.log(`  [DRY RUN] create alias ${alias} -> ${target}`); return; }

    const using = ["urn:ietf:params:jmap:core", "https://www.fastmail.com/dev/user", "https://www.fastmail.com/dev/customer"];
    const res = await jmap(using, [["Alias/set", {
      accountId: resolvedAccountId,
      create: {
        [alias]: {
          email: alias,
          targetEmails: [target],
          targetGroupRef: null,
          restrictSendingTo: "everybody",
          description: "",
        },
      },
      onSuccessUpdateIdentities: true,
    }, "0"]]);

    const result = res.methodResponses[0][1];
    if (result.created) {
      console.log(`  created alias ${alias} -> ${target}`);
    } else if (result.notCreated) {
      const err = Object.values(result.notCreated)[0];
      console.error(`  failed: ${err.type}${err.description ? ` — ${err.description}` : ""}`);
      process.exit(1);
    } else {
      console.error("  unexpected:", JSON.stringify(result, null, 2));
      process.exit(1);
    }
    return;
  }

  console.error("usage: <list|create [args]|discover>");
  process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
