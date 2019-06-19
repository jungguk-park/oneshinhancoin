/* global getAssetRegistry getParticipantRegistry */

/**
 * Close the bidding for a vehicle listing and choose the
 * highest bid that is over the asking price
 * @param {org.one.shinhan.coin.Finish_Voting} Finish_Voting - the Finish_Voting transaction
 * @transaction
 */
async function finish_voting(finish_voting) {  // eslint-disable-line no-unused-vars
    const listing = finish_voting.listing;
  
  	if (listing.state !== 'ON_VOTING') {
        throw new Error('Listing is not ON_VOTING');/*현재 과제에 대한 평가(voting 중이 아니면 중지)*/
    }
  	console.log('#### test1');  
    // by default we mark the listing as RESERVE_NOT_MET
    listing.state = 'RESERVE_NOT_MET';
    let highestVote = null;
    let project_challenger = null;
    let project_issuer = null;
  	if (listing.votes && listing.votes.length > 0) {
        listing.votes.sort(function(a, b) {
            return (b.voting_card_cnt - a.voting_card_cnt);
        });
        highestVote = listing.votes[0];
        listing.state = 'VOTING_END';      
        project_challenger = highestVote.projectIdeaId;        
        listing.project.winner = project_challenger; /* 가장 높은 득점을 한 프로젝트 참가자에게 해당 프로젝트를 전달*/
        // clear the offers
        listing.votes = null;        
    }

    if (highestVote) {
        // save the project
        const projectRegistry = await getAssetRegistry('org.one.shinhan.coin.Project');
        await projectRegistry.update(listing.project);
    }

    // save the project listing
    const projectListingRegistry = await getAssetRegistry('org.one.shinhan.coin.ProjectListing');
    await projectListingRegistry.update(listing);
/*
    if (listing.state === 'VOTING_END') {
        // save the project_challenger
        const userRegistry = await getParticipantRegistry('org.one.shinhan.coin.project.voiting.ProjectIdeaID');
        await userRegistry.updateAll([project_challenger, listing.vehicle.owner]);
    }
    */
}

/**
 * Make an Offer for a VehicleListing
 * @param {org.one.shinhan.coin.Vote} vote - vote
 * @transaction
 */
async function makeVote(vote) {  // eslint-disable-line no-unused-vars
    let listing = vote.listing;
    if (listing.state !== 'ON_VOTING') {
        throw new Error('Listing is not On voting');
    }
    if (!listing.votes) {
        listing.votes = [];
    }
    listing.votes.push(vote);

    // save the vote listing
    const projectListingRegistry = await getAssetRegistry('org.one.shinhan.coin.ProjectListing');
    await projectListingRegistry.update(listing);
}
