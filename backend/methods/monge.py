from copy import deepcopy

def monge(m_votes, v_const_seats, v_party_seats,
                            m_prior_allocations, divisor_gen, threshold=None,
                            orig_votes=None, **kwargs):
    """Apportion by Monge algorithm"""

    def divided_vote(m_votes, m_prior_allocations, constituency, party, divisor_gen):
        gen = divisor_gen()
        for seat in range(1+sum([v_constituency_allocations[party]
                                for v_constituency_allocations in m_prior_allocations])):
            divisor = next(gen)
        return float(m_votes[constituency][party])/divisor

    m_allocations = deepcopy(m_prior_allocations)
    total_seats = sum(v_const_seats)
    allocated_seats = sum([sum(x) for x in m_allocations])
    for seat in range(total_seats - allocated_seats):
        #calculate max_Monge_ratio
        max_Monge_ratio = 0
        for constituency in range(len(m_votes)):
            for party in range(len(m_votes[0])):
                a = divided_vote(m_votes, m_allocations, constituency, party, divisor_gen)
                min_ratio = 1
                none_found = True
                for other_constituency in range(len(m_votes)):
                    if other_constituency == constituency:
                        continue
                    for other_party in range(len(m_votes[0])):
                        if other_party == party:
                            continue
                        d = divided_vote(m_votes, m_allocations, other_constituency, other_party, divisor_gen)
                        b = divided_vote(m_votes, m_allocations, constituency, other_party, divisor_gen)
                        c = divided_vote(m_votes, m_allocations, other_constituency, party, divisor_gen)
                        try:
                            ratio = (a*d)/(b*c)
                        except ZeroDivisionError:
                            ratio = 1
                        if none_found or ratio < min_ratio:
                            min_ratio = ratio
                            reference_constituency = other_constituency
                            reference_party = other_party
                            none_found = False
                if min_ratio > max_Monge_ratio:
                    max_Monge_ratio = min_ratio
                    max_constituency = constituency
                    max_party = party

        #allocate seat based on Monge ratio
        m_allocations[max_constituency][max_party] += 1

    return m_allocations
