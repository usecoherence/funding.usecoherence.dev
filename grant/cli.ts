#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program.name("grant").description("Coherence grant tracking CLI").version("0.1.0");

program.parse(process.argv);
