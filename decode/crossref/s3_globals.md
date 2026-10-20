## 3. Shared globals (DS 0C7C, used by >= 2 areas)

One row per DS offset whose references (decode/globals_xref.tsv) come from routines of two or more areas. Area of a routine = canonical area of its unit (§1). Name = the merged name (lane names beat `g_XXXX`; see §2 for the conflicts). Type/init/evidence from GLOBALS.md; meaning = the naming lane's evidence (GLOBALS.md last column and the lane pseudo file). R = read/address taken, W = written.

| DS | name | type | init | areas: writers | areas: readers only | evidence / notes |
|---|---|---|---|---|---|---|
| 0150 | g_0150 | var/record (address taken) | 00 00 |  | ENGINE, PARTY |  |
| 0D24 | CoinValue | array (elem 2 B?) | 01 00 |  | COMBAT, PARTY | name from combat_names.json |
| 0D26 | g_0D26 | array (elem 2 B?) | 00 00 |  | COMBAT, PARTY |  |
| 0D30 | g_0D30 | word | c8 00 |  | COMBAT, PARTY |  |
| 0D32 | g_0D32 | word | 00 00 |  | COMBAT, PARTY |  |
| 260A | g_260A | var/record (address taken) | 00 11 |  | PARTY, VIEW |  |
| 2622 | g_2622 | word | 07 00 |  | COMBAT, VIEW |  |
| 2628 | g_2628 | word | 0a 00 |  | COMBAT, ECL, VIEW |  |
| 262A | g_262A | word | 0b 00 |  | ECL, MAGIC |  |
| 2736 | g_2736 | array (elem 1 B?) | 00 |  | COMBAT, ENGINE, MAGIC, PARTY, VIEW |  |
| 273F | g_273F | array (elem 1 B?) | ff |  | COMBAT, ENGINE, MAGIC, PARTY, VIEW |  |
| 2744 | CombatTerrain | array (elem 1 B?) | 01 |  | COMBAT, MAGIC, VIEW | name from view_names.json |
| 286B | g_286B | array (elem 1 B?) | 01 |  | COMBAT, ENGINE |  |
| 290D | CloudSquareDir | array (elem 1 B?) | 50 |  | MAGIC, PARTY | name from party_names.json |
| 31FA | SpellTable | array (elem 1 B?) | 00 |  | ENGINE, MAGIC | name from magic_names.json |
| 31FB | g_31FB | array (elem 1 B?) | 00 |  | MAGIC, PARTY |  |
| 3200 | g_3200 | array (elem 1 B?) | 00 |  | COMBAT, MAGIC |  |
| 3204 | g_3204 | array (elem 1 B?) | 00 |  | COMBAT, MAGIC |  |
| 3C7C | BaseThac0 | array (elem 1 B?) | '(((***,,,.((((***,,,.(()*+,-./01(()*+,-.' |  | PARTY, VIEW | name from party_names.json |
| 409B | XpForLevel | array (elem 2 B?) | 00 00 |  | MAGIC, PARTY | name from party_names.json |
| 409D | g_409D | array (elem 2 B?) | 01 02 |  | MAGIC, PARTY |  |
| 43DC | g_43DC | word | 00 00 | RUNTIME: Overlay.OvrInit, Overlay.OvrSetBuf | ENGINE |  |
| 4408 | HeapEnd | word | 00 00 | ENGINE: InitConfiguration | RUNTIME | far ptr; seg 440A = PSP:[2] memory top (System.Init) |
| 440A | HeapEnd_hi | word | 00 00 | ENGINE: InitConfiguration; RUNTIME: System.Init |  | inside HeapEnd (+2h) |
| 4414 | HeapError | word | 00 00 | PARTY: InstallHeapErrorHandler; RUNTIME: System.Init |  | far proc ptr; System.Init stores CS:00A9 |
| 4416 | HeapError_hi | word | 00 00 | PARTY: InstallHeapErrorHandler; RUNTIME: System.Init |  | inside HeapError (+2h) |
| 49D1 | cfg_FullIntro | byte | bss | ENGINE: InitConfiguration | PARTY | name from party_names.json |
| 49D2 | ecl_Mem4900 | far pointer | bss | PARTY: InitGameState | COMBAT, ECL, ENGINE, MAGIC, VIEW | name from ecl_names.json |
| 49D6 | ecl_Mem6B00 | far pointer | bss | PARTY: InitGameState | COMBAT, ECL, ENGINE, MAGIC, VIEW | name from ecl_names.json |
| 49DA | ecl_Mem9700 | far pointer | bss | PARTY: InitGameState | ECL | name from ecl_names.json |
| 49DE | ecl_CodeBuf | far pointer | bss | PARTY: InitGameState | ECL | name from ecl_names.json |
| 49E2 | GameSpeed | byte | bss | MAGIC: GameSpeedMenu; PARTY: InitGameState, LoadGame | COMBAT, ENGINE | name from magic_names.json |
| 49E5 | ecl_VecB | word | bss | ECL: ecl_InitVM | VIEW | name from ecl_names.json |
| 49ED | ecl_PC | word | bss | ECL: ecl_Gosub, ecl_InitVM, ecl_ReadOperands, ecl_Run, ecl_SkipInstruction, ecl_UnpackString, ecl_op00_Exit, ecl_op01_Goto, e; PARTY: InitGameState; VIEW: ExploreCommand |  | name from ecl_names.json |
| 49F3 | game_Mode | byte | bss | COMBAT: AfterCombat, DragonFinale; ECL: ecl_GameLoop, ecl_RunAfterNewBlock, ecl_op24_Combat; ENGINE: SwitchToExploreMode; MAGIC: Camp, CombatMain, Temple; PARTY: ItemGiantStrength, PartyCreationMenu, Shop; VIEW: StartCombat |  | name from engine_names.json |
| 49F4 | g_49F4 | byte | bss | PARTY: InitGameState | MAGIC |  |
| 49F5 | opt_Portraits | byte | bss | MAGIC: AlterMenu; PARTY: InitGameState, LoadGame | COMBAT | name from magic_names.json |
| 49F6 | opt_MonsterPics | byte | bss | MAGIC: AlterMenu; PARTY: InitGameState, LoadGame | ECL | name from magic_names.json |
| 49F7 | DebugFlag | byte | bss | ENGINE: ReadGameKey; PARTY: InitGameState | VIEW | name from engine_names.json |
| 49F8 | g_49F8 | byte | bss | ECL: ecl_InitVM; PARTY: InitGameState, PartyCreationMenu |  |  |
| 49F9 | g_49F9 | byte | bss | ECL: ecl_RunAfterNewBlock; PARTY: InitGameState; VIEW: ExploreCommand |  |  |
| 49FA | travel_Mode | byte | bss | ECL: ecl_RunAfterNewBlock; PARTY: InitGameState | ENGINE, VIEW | name from view_names.json |
| 49FD | pic_HeadId | ? | bss | ECL: ShowHeadBodyPicture | ENGINE | name from ecl_names.json |
| 49FE | pic_BodyId | ? | bss | ECL: ShowHeadBodyPicture | ENGINE | name from ecl_names.json |
| 49FF | PartyDead | byte | bss | COMBAT: ResolveCombatOutcome; ECL: ecl_GameLoop, ecl_op2E_Damage; PARTY: InitGameState |  | name from ecl_names.json |
| 4A00 | TextOutputActive | byte | bss | COMBAT: AfterCombat; ECL: ecl_op11_Print, ecl_op29_EncounterMenu; PARTY: InitGameState | ENGINE | name from ecl_names.json |
| 4A1E | VideoMode | byte | bss | ENGINE: InitConfiguration | COMBAT, PARTY, VIEW | name from view_names.json |
| 4A20 | g_4A20 | far pointer | bss |  | COMBAT, ENGINE, PARTY, VIEW |  |
| 4A22 | g_4A20_hi | word | bss |  | COMBAT, ENGINE, PARTY, VIEW | inside g_4A20 (+2h) |
| 4A24 | PicSaveBuffer | far pointer | bss |  | ENGINE, PARTY | name from engine_names.json |
| 4A28 | view_LineDirty | array (elem 1 B?) | bss | ENGINE: DrawPicture, DrawPictureInto, FillPictureRect | PARTY | name from engine_names.json |
| 4AD0 | view_SpanScreenX | array (elem 2 B?) | bss | ENGINE: DrawPicture, DrawPictureInto, FillPictureRect | PARTY | name from engine_names.json |
| 4C20 | view_SpanFirst | array (elem 2 B?) | bss | ENGINE: DrawPicture, DrawPictureInto, FillPictureRect | PARTY | name from engine_names.json |
| 4D70 | view_SpanLast | array (elem 2 B?) | bss | ENGINE: DrawPicture, DrawPictureInto, FillPictureRect | PARTY | name from engine_names.json |
| 4EC0 | cga_LineSeg | array (elem 2 B?) | bss | PARTY: InitGameState | ENGINE | name from engine_names.json |
| 5050 | ega_LineOfs | array (elem 2 B?) | bss | PARTY: InitGameState | ENGINE | name from engine_names.json |
| 51E0 | m2_LineSeg | array (elem 2 B?) | bss | PARTY: InitGameState | ENGINE | name from engine_names.json |
| 5370 | ClipPictures | byte | bss | PARTY: InitGameState | ENGINE | name from engine_names.json |
| 5374 | SoundTransientMode | word | bss | ENGINE: SetSoundTimerMode; PARTY: InitGameState |  | name from engine_names.json |
| 5376 | DataSet | byte | bss | ENGINE: RestoreDataSet, SetDataSet; PARTY: InitGameState, LoadGame, PartyCreationMenu | COMBAT, ECL, VIEW | name from ecl_names.json |
| 5377 | PrevDataSet | byte | bss | ENGINE: SetDataSet; PARTY: InitGameState |  | name from engine_names.json |
| 537A | SavePath | var/record (address taken) | bss |  | ENGINE, PARTY | name from engine_names.json |
| 547C | DataPath | byte | bss | PARTY: InitGameState, ShowTitle | ECL, ENGINE | name from engine_names.json |
| 547D | DataDrive | ? | bss |  | ENGINE, PARTY | name from party_names.json |
| 557C | NoDiskPrompt | byte | bss | ECL: LoadEclBlock; PARTY: InitGameState, LoadMonster | ENGINE | name from engine_names.json |
| 557D | GameSaved | byte | bss | ECL: ecl_CampCheck; PARTY: InitGameState, PartyCreationMenu, SaveGame |  | name from party_names.json |
| 5582 | ItemTypeTable | array (elem 1 B?) | bss |  | COMBAT, ENGINE, MAGIC, PARTY | name from party_names.json |
| 5583 | g_5583 | array (elem 1 B?) | bss |  | COMBAT, ENGINE |  |
| 558E | g_558E | array (elem 1 B?) | bss |  | COMBAT, ENGINE |  |
| 5590 | g_5590 | array (elem 1 B?) | bss |  | COMBAT, ENGINE |  |
| 5D92 | SelectedChar | far pointer | bss | COMBAT: Attack, CycleSelectedChar, RemoveMonstersAfterCombat, ResolveCombatOutcome; ECL: ecl_RunAfterNewBlock, ecl_op00_Exit, ecl_op0A_LoadCharacter, ecl_op0B_LoadMonster, ecl_op2E_Damage, ecl_op38_Program; MAGIC: TakeTurn; PARTY: AddToParty, CreateCharacter, InitGameState, LoadGame, RemoveFromParty; VIEW: DeployParty | ENGINE | name from ecl_names.json |
| 5D94 | g_5D92_hi | word | bss | COMBAT: Attack, CycleSelectedChar, RemoveMonstersAfterCombat, ResolveCombatOutcome; ECL: ecl_RunAfterNewBlock, ecl_op00_Exit, ecl_op0A_LoadCharacter, ecl_op0B_LoadMonster, ecl_op2E_Damage, ecl_op38_Program; MAGIC: TakeTurn; PARTY: AddToParty, CreateCharacter, InitGameState, LoadGame, RemoveFromParty; VIEW: DeployParty | ENGINE | inside g_5D92 (+2h) |
| 5D96 | PartyHead | word | bss | MAGIC: MoveSelectedDown, MoveSelectedUp; PARTY: AddToParty, InitGameState, RemoveFromParty | COMBAT, ECL, ENGINE, VIEW | name from ecl_names.json |
| 5D98 | g_5D98 | word | bss | MAGIC: MoveSelectedDown, MoveSelectedUp; PARTY: AddToParty, InitGameState, RemoveFromParty | COMBAT, ECL, ENGINE, VIEW |  |
| 5D9A | g_5D9A | word | bss | COMBAT: Attack; VIEW: StartCombat |  |  |
| 5D9C | g_5D9C | word | bss | COMBAT: Attack; VIEW: StartCombat |  |  |
| 5E20 | FontPtr | far pointer | bss | PARTY: InitGameState | ENGINE | name from engine_names.json |
| 5E22 | g_5E20_hi | word | bss | PARTY: InitGameState | ENGINE | inside g_5E20 (+2h) |
| 5E24 | text_Col | byte | bss | COMBAT: AfterCombat, MayLoseItem; ECL: ApplyEclDamage, ecl_op00_Exit, ecl_op11_Print, ecl_op15_VerticalMenu, ecl_op29_EncounterMenu, ecl_op2E_Damage, ecl_op33_; ENGINE: DrawWrappedText, RenderWrappedRun |  | name from ecl_names.json |
| 5E25 | text_Row | byte | bss | COMBAT: AfterCombat, MayLoseItem; ECL: ApplyEclDamage, ecl_op00_Exit, ecl_op11_Print, ecl_op15_VerticalMenu, ecl_op29_EncounterMenu, ecl_op2E_Damage, ecl_op33_; ENGINE: DrawCharacterSummary, DrawWrappedText |  | name from ecl_names.json |
| 5E3A | SymbolSets | array (elem 4 B?) | bss |  | PARTY, VIEW | name from view_names.json |
| 5E4E | SymbolPic | far pointer | bss |  | PARTY, VIEW | name from party_names.json |
| 5E52 | TileSetLo | far pointer | bss |  | COMBAT, PARTY, VIEW | name from view_names.json |
| 5E54 | g_5E52_hi | word | bss |  | COMBAT, VIEW | inside g_5E52 (+2h) |
| 5E56 | TileSetHi | word | bss |  | COMBAT, PARTY, VIEW | name from view_names.json |
| 5E58 | g_5E58 | word | bss |  | COMBAT, VIEW |  |
| 5E5A | CombatIcons | array (elem 4 B?) | bss |  | ENGINE, PARTY, VIEW | name from view_names.json |
| 5E5C | g_5E5A_hi | array (elem 2 B?) | bss |  | ENGINE, PARTY, VIEW | inside g_5E5A (+2h) |
| 5E5E | g_5E5E | array (elem 4 B?) | bss |  | PARTY, VIEW |  |
| 5E60 | g_5E5E_hi | array (elem 2 B?) | bss |  | PARTY, VIEW | inside g_5E5E (+2h) |
| 5F27 | cb_Col | array (elem 1 B?) | bss | COMBAT: AttacksOfOpportunity, StepCombatant; VIEW: PlaceCombatant, TryPlaceCombatant |  | name from view_names.json |
| 5F28 | cb_Row | array (elem 1 B?) | bss | COMBAT: AttacksOfOpportunity, StepCombatant; VIEW: PlaceCombatant, TryPlaceCombatant |  | name from view_names.json |
| 5F2A | cb_Size | byte | bss | COMBAT: GodsIntervene, RemoveFromCombat; VIEW: DeployParty, PlaceCombatant, RemoveCombatant |  | name from view_names.json |
| 604A | cb_ScrCol | array (elem 1 B?) | bss | VIEW: RebuildOccupancy, UpdateScreenPositions | ENGINE | name from view_names.json |
| 6092 | cb_ScrRow | array (elem 1 B?) | bss | VIEW: RebuildOccupancy, UpdateScreenPositions | ENGINE | name from view_names.json |
| 65B9 | cb_Char | array (elem 4 B?) | bss | VIEW: DeployParty | COMBAT, ENGINE, MAGIC, PARTY | name from view_names.json |
| 65BB | g_65B9_hi | array (elem 2 B?) | bss | VIEW: DeployParty | COMBAT, ENGINE, MAGIC, PARTY | inside g_65B9 (+2h) |
| 66D6 | g_66D6 | array (elem 4 B?) | bss | VIEW: DeployParty, RemoveCombatant | COMBAT, PARTY |  |
| 66D8 | g_66D6_hi | array (elem 2 B?) | bss | VIEW: DeployParty, RemoveCombatant | COMBAT, PARTY | inside g_66D6 (+2h) |
| 66DA | g_66DA | array (elem 1 B?) | bss | VIEW: DeployParty, RemoveCombatant | COMBAT, MAGIC, PARTY |  |
| 66DB | g_66DB | array (elem 1 B?) | bss | VIEW: DeployParty, RemoveCombatant | COMBAT, MAGIC, PARTY |  |
| 66DC | g_66DC | array (elem 1 B?) | bss | VIEW: DeployParty, RemoveCombatant | MAGIC |  |
| 6715 | BodyCount | byte | bss | VIEW: DeployParty, RemoveCombatant, StartCombat | COMBAT, MAGIC, PARTY | name from combat_names.json |
| 6716 | cm_Map | far pointer | bss | MAGIC: EndCombat; VIEW: PrepareBattlefield | COMBAT, ENGINE, PARTY | name from view_names.json |
| 6718 | tg_List | word | bss | MAGIC: EndCombat; VIEW: BuildTargetList, PrepareBattlefield | COMBAT, ENGINE, PARTY | inside g_6716 (+2h); name from view_names.json |
| 6719 | g_6716_3 | array (elem 1 B?) | bss | VIEW: BuildTargetList | ENGINE | inside g_6716 (+3h) |
| 671A | tg_Count | byte | bss | ENGINE: CollectOppositeSideTargets; VIEW: BuildTargetList | COMBAT, MAGIC | name from view_names.json |
| 671B | g_671B | var/record (address taken) | bss |  | COMBAT, ENGINE |  |
| 67F4 | TreasureMoney | word | bss | COMBAT: ComputeCombatXP, NpcTakesShare; ECL: ecl_op27_Treasure; PARTY: DropCoinsToPool, PoolMoney, SetPoolMoneyGold, ShareMoney, TakeCoins | MAGIC | name from ecl_names.json |
| 67F6 | g_67F6 | word | bss | COMBAT: ComputeCombatXP, NpcTakesShare; ECL: ecl_op27_Treasure; PARTY: DropCoinsToPool, PoolMoney, SetPoolMoneyGold, ShareMoney, TakeCoins |  |  |
| 6800 | g_6800 | ? | bss | PARTY: SetPoolMoneyGold | COMBAT |  |
| 6802 | g_6802 | word | bss | PARTY: SetPoolMoneyGold | COMBAT |  |
| 6804 | g_6804 | word | bss | COMBAT: SellItem; PARTY: AddPlatinumOrPool, SetPoolMoneyGold |  |  |
| 6806 | g_6806 | word | bss | COMBAT: SellItem; PARTY: AddPlatinumOrPool, SetPoolMoneyGold |  |  |
| 6810 | TreasureItems | far pointer | bss | COMBAT: AfterCombat, Attack, ComputeCombatXP, TakeLootItems; ECL: ecl_op1C_ClearMonsters, ecl_op27_Treasure; PARTY: InitGameState |  | name from ecl_names.json |
| 6812 | g_6810_hi | word | bss | COMBAT: AfterCombat, Attack, ComputeCombatXP, TakeLootItems; ECL: ecl_op1C_ClearMonsters, ecl_op27_Treasure; PARTY: InitGameState |  | inside g_6810 (+2h) |
| 6814 | side_ActiveCount | byte | bss | ENGINE: ApplyDamage, CountActiveSides | COMBAT, MAGIC, PARTY, VIEW | name from engine_names.json |
| 6815 | g_6815 | byte | bss | ENGINE: CountActiveSides | MAGIC |  |
| 6816 | SaveRoll | byte | bss | COMBAT: SavingThrow; PARTY: EffConSaveBonusMagic, EffConSaveBonusPoison, EffFireResistance, EffImmunePoisonParalysis, EffPenalty4, EffPenaltyAll4, E |  | name from combat_names.json |
| 6817 | EffectToApply | byte | bss | COMBAT: ApplyEffect; PARTY: CancelDamageAndEffect |  | name from combat_names.json |
| 6818 | DamageAmount | byte | bss | COMBAT: DamageCharacter, MeleeAttack, RollDamage; PARTY: AvoidRangedAttack, CancelDamageAndEffect, EffBonusVsUndead, EffEnfeebled, EffFireMinusOnePerDie, EffFireResistance, EffF |  | name from combat_names.json |
| 6819 | DamageType | byte | bss | COMBAT: RollDamage; MAGIC: ApplySpell, BoltHitSquare; PARTY: EffAcidDamage, EffBloodDrain, EffFireDamage, EffFlameTongue, EffHpDrainTick, EffHpLossTick, ItemAlignmentShock |  | name from combat_names.json |
| 681A | StatValue | byte | bss | COMBAT: CalcAttacks, CalcMove, StartCombatRound; PARTY: EffHaste, EffHeld, EffSlow |  | name from combat_names.json |
| 681B | sp_Current | byte | bss | MAGIC: CastSpell; PARTY: EffCharmGaze |  | name from party_names.json |
| 681C | LastDiceCount | byte | bss | COMBAT: RollDice | PARTY | name from combat_names.json |
| 681D | StatKind | byte | bss | COMBAT: CalcAttacks, CalcMove, StartCombatRound | PARTY | name from combat_names.json |
| 681E | AttackBlocked | byte | bss | COMBAT: CanAttack; PARTY: EffInvisible, EffUnattackable, EffUntouchableBeforeTurn, EffWardedByItem |  | name from combat_names.json |
| 681F | cure_InProgress | byte | bss | MAGIC: CureDisease, InitSpellTable, NeutralizePoison, Power_Cure, RaiseDead, Spell_CureDisease; PARTY: EffSlowPoisonEnd |  | name from magic_names.json |
| 6820 | SpellArea | byte | bss | COMBAT: CollectSpellTargets; MAGIC: ApplyToSide, CastSpell, HasteSlow, LightningBolt, Spell_AnimateDead, Spell_DispelMagic, Spell_Fireball, Spell_Sleep, Spe | PARTY | name from combat_names.json |
| 6821 | ItemsChanged | byte | bss | COMBAT: ItemsMenu; MAGIC: InitSpellTable; PARTY: ItemAlignmentShock, ItemGiantStrength |  | name from party_names.json |
| 6822 | AttackRollValue | byte | bss | COMBAT: AttackRoll, AttackRollVsAC, MeleeAttack; PARTY: AvoidRangedAttack, EffBless, EffBonusVsUndead, EffCurse, EffDisplacement, EffDwarfAttackBonus, EffDwarfGiantDefence, Eff; VIEW: StartCombat |  | name from combat_names.json |
| 6823 | SlotHits | byte | bss | COMBAT: MeleeAttack; PARTY: AvoidRangedAttack |  | name from combat_names.json |
| 6825 | MoraleValue | byte | bss | COMBAT: AiMoraleCheck; PARTY: EffBless, EffCharm, EffCurse |  | name from party_names.json |
| 6826 | HookOpponent | far pointer | bss | COMBAT: ov13_3A86; PARTY: EffBloodDrain, EffBonusVsUndead, EffCharmGaze, EffDwarfAttackBonus, EffDwarfGiantDefence, EffFlameTongue, EffGnomeAttack |  | name from party_names.json |
| 6828 | g_6826_hi | word | bss | COMBAT: ov13_3A86; PARTY: EffBloodDrain, EffBonusVsUndead, EffCharmGaze, EffDwarfAttackBonus, EffDwarfGiantDefence, EffFlameTongue, EffGnomeAttack |  | inside g_6826 (+2h) |
| 682A | SaveType | byte | bss | COMBAT: SavingThrow | PARTY | name from combat_names.json |
| 6A58 | WallBuf | far pointer | bss | PARTY: InitGameState | VIEW | name from view_names.json |
| 6A5C | MapBuf | far pointer | bss | PARTY: InitGameState | VIEW | name from view_names.json |
| 6AAC | view_AreaMap | byte | bss | ECL: ShowEncounter; PARTY: InitGameState; VIEW: ExploreCommand, RefreshView |  | name from view_names.json |
| 6AAD | party_MapX | byte | bss | ECL: StepForward, ecl_SetMem; PARTY: CheckEclDisk, InitGameState; VIEW: StepForward3D, TryWalkOffMap | ENGINE | name from ecl_names.json |
| 6AAE | party_MapY | word | bss | ECL: StepForward, ecl_SetMem, ecl_op21_LoadFilesPieces; PARTY: CheckEclDisk, InitGameState, LoadGame; VIEW: LoadWallSet, StepForward3D, TryWalkOffMap | ENGINE | name from ecl_names.json |
| 6AAF | party_Dir | byte | bss | ECL: ecl_SetMem; PARTY: InitGameState; VIEW: ExploreCommand | COMBAT, ENGINE | name from ecl_names.json |
| 6AB0 | party_Ahead | word | bss | ECL: StepForward, ecl_op21_LoadFilesPieces, ecl_op2D_Call; PARTY: InitGameState, LoadGame; VIEW: ExploreCommand, LoadWallSet, StepForward3D |  | name from view_names.json |
| 6AB1 | party_CellAttr | byte | bss | ECL: StepForward, ecl_RunAfterNewBlock, ecl_op2D_Call; VIEW: RefreshView, StepForward3D |  | name from view_names.json |
| 6ABE | enc_Anim | word | bss |  | ECL, ENGINE, PARTY, VIEW | name from view_names.json |
| 6B0A | g_6B0A | byte | bss | PARTY: InitGameState; VIEW: FreeAnimation |  |  |
| 6B1C | g_6B1C | byte | bss | PARTY: InitGameState; VIEW: FreeAnimation, LoadAnimation |  |  |
| 6B29 | menu_Top | word | bss | PARTY: InitGameState; VIEW: PageList, VerticalListMenu |  | name from view_names.json |
| 6B80 | ScrollItem | far pointer | bss | COMBAT: UseItem; MAGIC: AddScrollSpells, ChooseSpell |  | name from combat_names.json |
| 6B82 | g_6B80_hi | word | bss | COMBAT: UseItem; MAGIC: AddScrollSpells, ChooseSpell |  | inside g_6B80 (+2h) |
| 6C91 | g_6C91 | array (elem 4 B?) | bss | COMBAT: CollectSpellTargets; MAGIC: ApplyToSide, HasteSlow, SelectTargetsCamp, Spell_Fireball, Spell_Sleep, Spell_SnakeCharm |  |  |
| 6C93 | g_6C91_hi | array (elem 2 B?) | bss | COMBAT: CollectSpellTargets; MAGIC: ApplyToSide, HasteSlow, SelectTargetsCamp, Spell_Fireball, Spell_Sleep, Spell_SnakeCharm |  | inside g_6C91 (+2h) |
| 6C94 | SpellTargetCount | byte | bss | COMBAT: CollectSpellTargets; MAGIC: SelectTargetsCamp, Spell_AnimateDead, Spell_Fireball, Spell_SnakeCharm |  | inside g_6C91 (+3h); name from combat_names.json |
| 6C95 | SpellTargets | far pointer | bss | COMBAT: CollectSpellTargets; MAGIC: RemoveCurseService, SelectTargetsCamp, Spell_SlowPoison |  | name from combat_names.json |
| 6C97 | g_6C95_hi | word | bss | COMBAT: CollectSpellTargets; MAGIC: RemoveCurseService, SelectTargetsCamp, Spell_SlowPoison |  | inside g_6C95 (+2h) |
| 6DB9 | SpellX | byte | bss | COMBAT: ChooseSpellTarget, CollectSpellTargets; MAGIC: BreathWeapon, LightningBolt |  | name from combat_names.json |
| 6DBA | SpellY | byte | bss | COMBAT: ChooseSpellTarget, CollectSpellTargets; MAGIC: BreathWeapon, LightningBolt |  | name from combat_names.json |
| 6DBB | sc_List | far pointer | bss | MAGIC: EndCombat, Spell_StinkingCloud; PARTY: EffCloudRemoved; VIEW: StartCombat |  | name from magic_names.json |
| 6DBD | g_6DBB_hi | word | bss | MAGIC: EndCombat, Spell_StinkingCloud; PARTY: EffCloudRemoved; VIEW: StartCombat |  | inside g_6DBB (+2h) |
| 6DBF | ItemCast | byte | bss | COMBAT: UseItem; MAGIC: InitSpellTable | ENGINE | name from combat_names.json |
| 6DC0 | PoolHasMoney | byte | bss | MAGIC: Temple; PARTY: PoolMoney, ShareMoney, Shop, TakeMoney |  | name from party_names.json |
| 6DC2 | RestClock | array (elem 2 B?) | bss | PARTY: DecRestClock, RestMenu | MAGIC | name from party_names.json |
| 6DC4 | g_6DC4 | word | bss | MAGIC: Rest; PARTY: RestMenu |  |  |
| 6DC6 | g_6DC6 | word | bss | MAGIC: Rest | PARTY |  |
| 6DC8 | g_6DC8 | word | bss | MAGIC: Rest | PARTY |  |
| 6DD8 | HealCounter | word | bss | MAGIC: Camp; PARTY: DailyHealing |  | name from party_names.json |
| 6DDA | RestActive | byte | bss | PARTY: InitGameState, RestLoop | ENGINE | name from party_names.json |
| 6DDC | g_6DDC | byte | bss | PARTY: InitGameState; VIEW: DrawOverlandParty |  |  |
| 6DDE | door_CanBash | byte | bss | VIEW: BashDoor | PARTY | name from view_names.json |
| 6DE3 | CombatRound | byte | bss | MAGIC: EndOfRound; VIEW: StartCombat | COMBAT, PARTY | name from combat_names.json |
| 6DE4 | foe_List | array (elem 1 B?) | bss | COMBAT: AutoTarget, FighterSweep; ENGINE: CollectOppositeSideTargets |  | name from combat_names.json |
| 6E30 | MagicOn | byte | bss | COMBAT: CheckCombatHotkeys; MAGIC: PlayerTurn; VIEW: StartCombat |  | name from magic_names.json |
| 6E31 | g_6E31 | var/record (address taken) | bss | COMBAT: TurnUndead | MAGIC |  |
| 6E36 | g_6E36 | far pointer | bss |  | COMBAT, ENGINE, MAGIC, VIEW |  |
| 6F68 | backdrop_Key3 | byte | bss | ECL: ecl_InitVM, ecl_SetMem; PARTY: InitGameState | VIEW | name from combat_names.json |
| 6F69 | backdrop_Key12 | byte | bss | ECL: ecl_InitVM, ecl_SetMem; PARTY: InitGameState | VIEW | name from combat_names.json |
| 70C6 | g_70C6 | byte | bss | ECL: ecl_InitVM | MAGIC |  |
| 70C7 | gfx_LoopCounter | byte | bss | ENGINE: DrawPicture, DrawPictureInto, FillPictureRect, RecolorPicture; VIEW: FreeAnimation |  | name from engine_names.json |
| 84D4 | DuelActive | byte | bss | ECL: SetupDuel, ecl_op24_Combat; PARTY: InitGameState | COMBAT, VIEW | name from ecl_names.json |
| 84DC | ecl_Block | byte | bss | ECL: ecl_GameLoop, ecl_op20_NewEcl | VIEW | name from ecl_names.json |
| 84DD | g_84DD | byte | bss | ECL: ecl_GameLoop; PARTY: InitGameState |  |  |
| 84DE | g_84DE | byte | bss | ECL: ecl_op00_Exit, ecl_op3D_ClearBox; PARTY: InitGameState |  |  |
| 84DF | g_84DF | byte | bss | ECL: ecl_op33_PrintReturn, ecl_op3C_PrintMem; PARTY: InitGameState |  |  |
| 84E0 | view_RedrawPicture | byte | bss | ECL: ShowEncounter, ecl_GameLoop, ecl_InitVM, ecl_op00_Exit, ecl_op0E_Picture, ecl_op24_Combat, ecl_op2D_Call, ecl_op31_Sprit; PARTY: InitGameState |  | name from combat_names.json |
| 84E3 | enc_SpriteOnScreen | byte | bss | ECL: ShowEncounter, ecl_op0E_Picture, ecl_op2D_Call, ecl_op31_SpriteOff; PARTY: InitGameState |  | name from ecl_names.json |
| 84E4 | g_84E4 | byte | bss | ECL: ecl_op11_Print, ecl_op15_VerticalMenu, ecl_op29_EncounterMenu; VIEW: ExploreCommand |  |  |
| 84E5 | view_RedrawParams | byte | bss | ECL: ecl_InitVM, ecl_SetMem, ecl_op2D_Call | VIEW | name from ecl_names.json |
| 84E9 | enc_MenuActive | byte | bss | ECL: ecl_op29_EncounterMenu; PARTY: InitGameState |  | name from ecl_names.json |
| 84F0 | g_84F0 | byte | bss | ENGINE: InitConfiguration; RUNTIME: RT_0A40_002E |  |  |
| 8608 | Output | var/record (address taken) | bss |  | ENGINE, RUNTIME, VIEW | TextRec (256 B); System.Init Assign/Rewrite, Crt.Init AssignCrt |

Shared offsets: 190, with a real name: 121, still `g_XXXX`: 69 (listed in §5 with their owner).

### Globals requests (STATUS.md) — APPLIED

| request | content | status |
|---|---|---|
| ecl globals request #1 | names in ecl_names.json (61 DS names: VM registers, text_Col/Row, enc_*, view_Redraw*, ...) | **APPLIED**: 61/61 shown in GLOBALS.md and the listings (merged names) |
| engine globals request #2 | names in engine_names.json (50 DS names: VideoMode, view_Line*, game_Mode, GameSpeed, DiskPromptText, ...) | **APPLIED**: 50/50 (4 tables with no direct code reference added as GLOBALS rows) |
| view globals request #1 | names in view_names.json (40 DS names: party_*, door_*, cm_Map, cb_*, menu_*, ...) | **APPLIED**: 40/40 |
| magic globals request #2 | names in magic_names.json (17: SpellTable, SpellNames, SpellHandlers, sp_Current, sc_List, ...) | **APPLIED**: 17/17; 6B84 SpellHandlers wins over COMBAT SpellTargetProc (§2b); 6DBB sc_List vs PARTY AreaEffectList = party fix request #xref-4 |
| combat (my lane) | names in combat_names.json (57 DS names) | **APPLIED** |

Mechanism: `decode/tools/globals.py` shows lane names (precedence as PorExport: real beats placeholder, later file wins) and adds lane-named offsets that no instruction references directly. `globals.json` keeps the placeholders so it never shadows a lane name.

### Global-name conflicts with PARTY (party fix request #xref-4) — APPLIED (PARTY DONE)

| DS | PARTY name | kept | reason |
|---|---|---|---|
| 2614 | DiskPrompt | DiskPromptText (ENGINE) | same variable, ENGINE published first |
| 5E52 | OverlandTiles | TileSetLo (VIEW) | VIEW names the pair 5E52/5E56 TileSetLo/Hi (two SQRPACI tile sets) |
| 6DBB | AreaEffectList | sc_List (MAGIC) | MAGIC owns the stinking-cloud list |
| party globals request #1 | names in party_names.json | **APPLIED** (shown in GLOBALS.md, listings) | |
