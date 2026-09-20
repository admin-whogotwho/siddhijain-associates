function money(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n)||0)}
function num(id){return Number(document.getElementById(id)?.value)||0}
function dateOnly(d){return new Date(d+'T00:00:00')}
function addDays(date,n){const x=new Date(date);x.setDate(x.getDate()+n);return x}
function fmtDate(d){return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function diffDays(a,b){return Math.max(0,Math.ceil((b-a)/86400000))}

function valuation(){
 const inv=num('investment'), eq=num('equity'), out=document.getElementById('valuationResult'); if(!out)return;
 if(eq<=0||eq>=100){out.innerHTML='<strong>Enter equity between 0.01% and 99.99%.</strong>';return}
 const post=inv/(eq/100), pre=post-inv;
 out.innerHTML=`<div class="result-grid"><div class="metric"><small>Post-money valuation</small><b>${money(post)}</b></div><div class="metric"><small>Pre-money valuation</small><b>${money(pre)}</b></div><div class="metric"><small>Investor ownership</small><b>${eq.toFixed(2)}%</b></div></div>`;
}
function endOfMonthDate(year, monthIndex){ return new Date(year, monthIndex + 1, 0); }
function addMonthsEOM(date, months){
 const target=new Date(date);
 const originalDay=target.getDate();
 const targetIndex=target.getMonth()+months;
 const year=target.getFullYear()+Math.floor(targetIndex/12);
 const month=((targetIndex%12)+12)%12;
 const last=endOfMonthDate(year,month).getDate();
 return new Date(year,month,Math.min(originalDay,last));
}
function rocCalendar(){
 const fy=document.getElementById('rocFyEnd')?.value, agm=document.getElementById('rocAgm')?.value, out=document.getElementById('rocResult');
 if(!out||!fy)return;
 const end=dateOnly(fy), type=document.getElementById('rocType')?.value||'private';
 const first=document.getElementById('rocFirst')?.value==='yes';
 const dpt=document.getElementById('rocDpt')?.value==='yes';
 const msme=document.getElementById('rocMsme')?.value==='yes';
 const adt=document.getElementById('rocAdt')?.value==='yes';
 const xbrl=document.getElementById('rocXbrl')?.value==='yes';
 const rows=[];
 const add=(name,date,basis,group='Companies Act / MCA')=>rows.push({name,date,basis,group});
 const statutoryAgmDue=addMonthsEOM(end, first ? 9 : 6);
 const agmDate=agm?dateOnly(agm):null;
 const agmForRelative=agmDate||statutoryAgmDue;
 const fyYear=end.getFullYear();
 const fyStartYear=fyYear-1;

 if(type!=='opc'){
   add(first?'First AGM — latest statutory date':'AGM — latest ordinary date',fmtDate(statutoryAgmDue),first?'Section 96: first AGM within 9 months from the close of the first financial year.':'Section 96: AGM generally within 6 months from the close of the financial year; Registrar extension is a separate fact-specific matter.');
   add('Board meetings — minimum frequency','At least 4 meetings / year','Section 173 read with SS-1: generally at least four Board meetings each year, with not more than 120 days between two consecutive meetings; specified classes have statutory exceptions.');
 }
 const relBasis=agmDate?'Calculated from the actual AGM date entered.':'AGM date not entered; calculated from the latest statutory AGM date for planning only.';
 add('AOC-4 / applicable financial statement form',fmtDate(addDays(agmForRelative,30)),`Section 137: generally within 30 days of AGM. ${relBasis}`);
 if(type!=='opc'){
   const annualForm=(type==='small')?'MGT-7A':'MGT-7';
   add(`${annualForm} — annual return`,fmtDate(addDays(agmForRelative,60)),`Section 92: generally within 60 days of AGM. ${relBasis}`);
 }
 if(adt) add('ADT-1 — auditor appointment / re-appointment',fmtDate(addDays(agmForRelative,15)),'Rule 4(2), Companies (Audit and Auditors) Rules: generally within 15 days of the appointment / re-appointment resolution, where ADT-1 is applicable.');
 if(dpt) add('DPT-3 — annual return of deposits / specified amounts','30 Jun '+fyYear,'Annual return under the applicable DPT-3 framework, generally due by 30 June in respect of amounts / deposits outstanding as at 31 March. Applicability and categories must be verified.');
 if(msme){
   add('MSME Form I — October to March period','30 Apr '+fyYear,'Half-yearly filing, where applicable, for outstanding payments to micro and small enterprise suppliers beyond the prescribed period.');
   add('MSME Form I — April to September period','31 Oct '+fyYear,'Half-yearly filing, where applicable, for the preceding April–September period.');
 }
 add('DIR-3 KYC / DIR-3 KYC-WEB — director KYC','30 Sep '+fyYear,'Rule 12A: annual KYC requirement for applicable DIN holders, subject to the current filing mode and exemptions.');
 if(xbrl && type!=='opc') add('AOC-4 XBRL — financial statements',fmtDate(addDays(agmForRelative,30)),'Use only where the company falls within the prescribed XBRL class. The applicable form and current rule position should be checked before filing.');

 if(type==='listed'){
   const q1=endOfMonthDate(fyStartYear,5), q2=endOfMonthDate(fyStartYear,8), q3=endOfMonthDate(fyStartYear,11), q4=end;
   const qs=[['Q1',q1,45],['Q2',q2,45],['Q3',q3,45],['Q4 / Annual',q4,60]];
   qs.forEach(q=>add(`LODR Reg. 33 / Integrated Filing – Financials ${q[0]}`,fmtDate(addDays(q[1],q[2])),`SEBI LODR Regulation 33: financial results generally within ${q[2]} days of the relevant quarter / financial year end. Current NSE compliance calendar also reflects Integrated Filing – Financials.`,'SEBI LODR'));
   [q1,q2,q3,q4].forEach((q,i)=>add(`LODR Reg. 31 — Shareholding Pattern ${['Q1','Q2','Q3','Q4'][i]}`,fmtDate(addDays(q,21)),'SEBI LODR Regulation 31: generally within 21 days from the end of the quarter; check the applicable framework for SME-listed entities.','SEBI LODR'));
   [q1,q2,q3,q4].forEach((q,i)=>add(`Integrated Filing – Governance ${['Q1','Q2','Q3','Q4 / Annual'][i]}`,fmtDate(addDays(q,30)),'Current NSE compliance calendar: Integrated Filing – Governance is generally within 30 days from the end of the quarter, subject to the applicable framework.','SEBI LODR'));
   [q1,q2,q3,q4].forEach((q,i)=>add(`Reconciliation of Share Capital Audit Report ${['Q1','Q2','Q3','Q4 / Annual'][i]}`,fmtDate(addDays(q,30)),'Current NSE compliance calendar: generally within 30 days from quarter end.','SEBI LODR'));
   add('LODR Reg. 24A — Secretarial Compliance Report',fmtDate(addDays(end,60)),'Annual secretarial compliance report framework for listed entities; verify the current SEBI circular / exchange filing requirements.','SEBI LODR');
   const annualReportDue=agmDate?addDays(agmDate,-21):null;
   add('LODR Reg. 34 — Annual Report',annualReportDue?`By ${fmtDate(annualReportDue)}`:'At least 21 days before AGM','Annual report must be made available within the statutory dispatch / AGM notice framework and not less than 21 days before the AGM; actual dispatch may need to be earlier.','SEBI LODR');
 }
 const groups=['Companies Act / MCA','SEBI LODR'];
 const html=groups.map(g=>{const rr=rows.filter(r=>r.group===g); if(!rr.length)return ''; return `<div class="calendar-group"><h3>${g}</h3><div class="table-wrap"><table class="mini-table"><thead><tr><th>Compliance</th><th>Due date / frequency</th><th>Legal mapping / note</th></tr></thead><tbody>${rr.map(r=>`<tr><td>${r.name}</td><td><strong>${r.date}</strong></td><td>${r.basis}</td></tr>`).join('')}</tbody></table></div></div>`}).join('');
 out.innerHTML=html+'<div class="notice"><strong>Important:</strong> This is a planning calendar, not an automatic filing instruction. AGM extensions, first-AGM rules, SME/listing status, XBRL applicability, DPT-3/MSME applicability, exemptions and event-based filings must be checked from the company facts and current MCA/SEBI requirements. Event-based filings such as DIR-12, PAS-3, MGT-14, SH-7, CHG-1 and INC-22 are triggered by the relevant event and are not inserted as recurring annual dates.</div>';
}
function lateFee(){
 const due=document.getElementById('lateDue')?.value,filed=document.getElementById('lateFiled')?.value,out=document.getElementById('lateResult'); if(!out||!due||!filed){if(out)out.innerHTML='<strong>Select both dates.</strong>';return}
 const days=diffDays(dateOnly(due),dateOnly(filed)), base=num('lateBase'), rate=num('lateRate'), add=days*rate;
 out.innerHTML=`<div class="result-grid"><div class="metric"><small>Days after due date</small><b>${days}</b></div><div class="metric"><small>Indicative additional fee</small><b>${money(add)}</b></div><div class="metric"><small>Indicative total</small><b>${money(base+add)}</b></div></div><p style="margin-top:15px">${days===0?'No delay based on the dates entered.':'Delay-based estimate only. Verify the exact MCA fee table and form-specific provisions before filing.'}</p>`;
}
function dilution(){
 const shares=num('dilShares'),pre=num('dilPre'),inv=num('dilInv'),esop=Math.min(50,Math.max(0,num('dilEsop'))),out=document.getElementById('dilutionResult'); if(!out)return;
 if(shares<=0||pre<=0){out.innerHTML='<strong>Enter positive existing shares and pre-money valuation.</strong>';return}
 const post=pre+inv, investorPct=inv/post, founderPrePct=1-investorPct, pool=esop/100;
 const investorFinal=investorPct*(1-pool), founderFinal=founderPrePct*(1-pool), newEsop=pool;
 const pricePerShare=pre/shares, newInvestorShares=inv/pricePerShare;
 out.innerHTML=`<div class="result-grid"><div class="metric"><small>Investor — before ESOP pool</small><b>${(investorPct*100).toFixed(2)}%</b></div><div class="metric"><small>Investor — after pool</small><b>${(investorFinal*100).toFixed(2)}%</b></div><div class="metric"><small>Existing holders — after pool</small><b>${(founderFinal*100).toFixed(2)}%</b></div></div><div class="table-wrap"><table class="mini-table"><tr><th>Holder</th><th>Post-round ownership</th><th>Indicative shares</th></tr><tr><td>Existing shareholders</td><td>${(founderFinal*100).toFixed(2)}%</td><td>${Math.round(shares).toLocaleString('en-IN')}</td></tr><tr><td>New investor</td><td>${(investorFinal*100).toFixed(2)}%</td><td>${Math.round(newInvestorShares).toLocaleString('en-IN')}</td></tr><tr><td>ESOP pool</td><td>${(newEsop*100).toFixed(2)}%</td><td>Calculated on fully diluted basis</td></tr></table></div>`;
}
function dcf(){
 const fs=[1,2,3,4,5].map(i=>num('dcf'+i)),w=num('dcfWacc')/100,g=num('dcfG')/100,debt=num('dcfDebt'),sh=num('dcfShares'),out=document.getElementById('dcfResult'); if(!out)return;
 if(w<=g||w<=0){out.innerHTML='<strong>Discount rate must be greater than terminal growth.</strong>';return}
 let pv=0; fs.forEach((f,i)=>pv+=f/Math.pow(1+w,i+1)); const tv=fs[4]*(1+g)/(w-g),tvPv=tv/Math.pow(1+w,5),ev=pv+tvPv,eq=ev-debt,per=sh>0?eq/sh:0;
 out.innerHTML=`<div class="result-grid"><div class="metric"><small>PV of forecast FCF</small><b>₹${pv.toFixed(2)} lakh</b></div><div class="metric"><small>Enterprise value</small><b>₹${ev.toFixed(2)} lakh</b></div><div class="metric"><small>Equity value</small><b>₹${eq.toFixed(2)} lakh</b></div></div><p style="margin-top:15px">Terminal value: ₹${tv.toFixed(2)} lakh. Indicative value per share: ${sh>0?'₹'+per.toFixed(2):'Enter shares'}.</p>`;
}
function femaGuide(){
 const ev=document.getElementById('femaEvent')?.value,d=document.getElementById('femaDate')?.value,out=document.getElementById('femaResult'),checks=document.getElementById('femaChecks'); if(!out||!checks)return;
 const base=d?dateOnly(d):new Date(); let title='',due='';
 if(ev==='issue'){title='FC-GPR / issue reporting';due=fmtDate(addDays(base,30));}
 else if(ev==='transfer'){title='FC-TRS / transfer reporting';due=fmtDate(addDays(base,60))+'*';}
 else if(ev==='fla'){title='FLA return';due='15 Jul of the relevant reporting year';}
 else if(ev==='esop'){title='ESOP reporting';due=fmtDate(addDays(base,30));}
 else {title='Fact-specific FEMA review';due='Depends on transaction';}
 out.innerHTML=`<div class="result-grid"><div class="metric"><small>Event</small><b>${title}</b></div><div class="metric"><small>Indicative reporting point</small><b>${due}</b></div><div class="metric"><small>Route</small><b>RBI FIRMS / AD Bank</b></div></div>`;
 const common=['Confirm investor / transferor / transferee residential status and instrument.','Check sectoral cap, entry route, prohibited sectors and Government approval requirement.','Check pricing guidelines / valuation certificate requirements.','Confirm beneficial ownership and downstream investment implications where relevant.','Retain valuation, remittance, shareholding and board/shareholder approval trail.'];
 const specific=ev==='issue'?['Confirm issue of equity instruments within the FEMA time limit after receipt of consideration.','FC-GPR reporting is generally within 30 days of issue.']:ev==='transfer'?['Determine whether FC-TRS is applicable to the exact transfer.','RBI material states the reporting period is generally 60 days from transfer or receipt/remittance of funds, whichever is earlier.']:ev==='fla'?['Confirm FDI / LLP investment existed in the relevant year.','FLA return is generally due by 15 July each year.']:['Confirm applicable ESOP reporting route and recipient eligibility.','RBI regulations provide a 30-day reporting point for applicable ESOP issues.'];
 checks.innerHTML=[...specific,...common].map(x=>`<div class="check">□ ${x}</div>`).join('');
}
function ipoCheck(){
 const years=num('ipoYears'),lit=document.getElementById('ipoLit')?.value,out=document.getElementById('ipoResult');if(!out)return;
 const items=[['Corporate structure and eligibility','Confirm public-company status / conversion, authorised and paid-up capital and Articles.'],['Financial statements and restatements',years>=3?'Three years entered; detailed eligibility and restatement review still required.':'Less than three years entered; review applicable eligibility route.'],['Governance','Board composition, committees, related-party framework, policies and statutory registers.'],['Capital structure','Check pre-issue capital, promoter holding, lock-in, options, convertibles and historical issuances.'],['Litigation / defaults',lit==='no'?'No issue flagged by the user; conduct independent legal and financial diligence.':'Material litigation/default issue flagged — detailed diligence required.'],['Disclosures','Build offer-document disclosures, risk factors, financial and legal due diligence schedules.'],['SEBI / exchange framework','Check current SEBI ICDR, LODR where applicable, stock-exchange eligibility and current circulars.']];
 const flagged=(years<3?1:0)+(lit!=='no'?1:0); out.innerHTML=`<div class="result-grid"><div class="metric"><small>Preliminary flags</small><b>${flagged}</b></div><div class="metric"><small>Checklist items</small><b>${items.length}</b></div><div class="metric"><small>Status</small><b>${flagged?'Needs review':'Initial screen passed'}</b></div></div><div class="table-wrap"><table class="mini-table"><tr><th>Area</th><th>Preliminary assessment</th></tr>${items.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</table></div>`;
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-menu]').forEach(x=>x.addEventListener('click',()=>{const n=document.querySelector('.navlinks');n.style.display='flex';n.style.flexDirection='column';n.style.position='absolute';n.style.right='5vw';n.style.top='76px';n.style.background='#FCFBF7';n.style.padding='20px';n.style.border='1px solid #DED9CE'}));
 document.querySelectorAll('.tool-tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tool-tab').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tool-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById('tool-'+btn.dataset.tool).classList.add('active');}));
 valuation(); rocCalendar(); lateFee(); dilution(); dcf(); femaGuide(); ipoCheck();
});
